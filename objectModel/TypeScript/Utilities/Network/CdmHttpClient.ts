// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import * as http from 'http';
import * as https from '../../Storage/request';
import { StorageAdapterConfigCallback } from '../../Storage/StorageAdapterConfigCallback';
import { CdmHttpRequest } from './CdmHttpRequest';
import { CdmHttpResponse } from './CdmHttpResponse';
import { HttpRequestCallback } from './HttpRequestCallback';

/**
 * CDM Http Client is an HTTP client which implements retry logic to execute retries in the case of failed requests.
 * A user can specify API endpoint when creating the client and additional path in the CDM HTTP request.
 * Alternatively, if a user doesn't specify API endpoint in the client, it has to specify the full path in the request.
 * The client also expects a user to specify callback function which will be used in the case of a failure (4xx or 5xx HTTP standard status codes).
 */
export class CdmHttpClient {

    /**
     * @internal
     */
    public headers: Map<string, string>;

    private apiEndpoint: string;

    private httpHandler: HttpRequestCallback;

    /**
     * Initializes a new instance of the CdmHttpClient.
     * @param {string} apiEndpoint The API endpoint
     * @param {HttpRequestCallback} httpHandler The HTTP handler which implements the interface to support injection of different system's http request methods.
     */
    constructor(apiEndpoint: string = undefined, httpHandler: HttpRequestCallback = undefined) {
        this.headers = new Map<string, string>();

        this.apiEndpoint = apiEndpoint;

        if (httpHandler !== undefined) {
            this.httpHandler = httpHandler;
        } else {
            // No handler specified, use the default one to make real requests.
            this.httpHandler = https.requestUrl;
        }
    }

    /**
     * @internal
     * Sends a CDM request with the retry logic.
     * @param {CdmHttpRequest} cdmRequest The CDM Http request.
     * @param {CdmHttpRStorageAdapterConfigCallbackequest} callback An optional parameter which specifies a callback function that gets executed after we try to execute the HTTP request.
     * @return {Promise}, representing the CDM HTTP response.
     */
    public async SendAsync(cdmRequest: CdmHttpRequest, callback: StorageAdapterConfigCallback = undefined): Promise<CdmHttpResponse> {
        // Merge headers first.
        this.headers.forEach((value: string, key: string) => {
            cdmRequest.headers.set(key, value);
        });

        return this.raceAsyncTaskAgainstTimeout(cdmRequest.maximumTimeout, this.SendAsyncHelper(cdmRequest, callback));
    }

    /**
     * Sends a CDM request with the retry logic helper function.
     * @param {CdmHttpRequest} cdmRequest The CDM Http request.
     * @param {CdmHttpRStorageAdapterConfigCallbackequest} callback An optional parameter which specifies a callback function that gets executed after we try to execute the HTTP request.
     * @return {Promise}, representing the CDM HTTP response.
     */
    private async SendAsyncHelper(cdmRequest: CdmHttpRequest, callback: StorageAdapterConfigCallback = undefined): Promise<CdmHttpResponse> {
        return new Promise<CdmHttpResponse>(async (resolve, reject) => {
            let fullUrl: string = undefined;

            if (this.apiEndpoint !== undefined) {
                fullUrl = CdmHttpClient.Combine(this.apiEndpoint, cdmRequest.requestedUrl);
            } else {
                fullUrl = cdmRequest.requestedUrl;
            }

            // Specific to TS, we have no other way of specifying the content type.
            if (cdmRequest.contentType !== undefined) {
                cdmRequest.headers.set('Content-Type', cdmRequest.contentType);
                cdmRequest.headers.set('Content-Length', Buffer.from(cdmRequest.content).length.toString());
            }

            let outgoingHeaders: http.OutgoingHttpHeaders = {};

            if (cdmRequest.headers !== undefined) {
                cdmRequest.headers.forEach((value: string, key: string) => {
                    outgoingHeaders[key] = value;
                });
            }

            // If the number of retries is 0, we only try once, otherwise we retry the specified number of times.
            for (let retryNumber = 0; retryNumber <= cdmRequest.numberOfRetries; retryNumber++) {

                let hasFailed: boolean = false;
                let response: CdmHttpResponse = undefined;

                try {
                    response = await this.raceAsyncTaskAgainstTimeout(cdmRequest.timeout, this.httpHandler(fullUrl, cdmRequest.method, cdmRequest.content, outgoingHeaders)) as CdmHttpResponse;
                }
                catch (err) {
                    hasFailed = true;

                    // Only throw an exception if another retry is not expected anymore.
                    if (callback === undefined || retryNumber === cdmRequest.numberOfRetries) {
                        if (retryNumber !== 0) {
                            reject('The number of retries has exceeded the maximum number allowed by the client.');
                            break;
                        } else {
                            reject(err);
                            break;
                        }
                    }
                }

                // Check whether we have a callback function set and whether this is not our last retry.
                if (callback !== undefined && retryNumber !== cdmRequest.numberOfRetries) {

                    // Call the callback function with the retry numbers starting from 1.
                    const waitTime = await callback(response, hasFailed, retryNumber + 1);

                    // Callback has returned that we do not want to retry anymore (probably successful request, client can set up what they want here).
                    if (waitTime === undefined) {
                        resolve(response);
                        break;
                    } else {
                        // Sleep time specified by the callback.
                        await CdmHttpClient.sleep(waitTime);
                    }
                } else {
                    // CDM Http Response exists, could be successful or bad (e.g. 403/404), it is up to caller to deal with it.
                    if (response !== undefined) {
                        resolve(response);
                        break;
                    } else {
                        if (retryNumber === 0) {
                            resolve(undefined);
                            break;
                        } else {
                            // If response doesn't exist repeatedly, just throw that the number of retries has exceeded (we don't have any other information).
                            reject('The number of retries has exceeded the maximum number allowed by the client.');
                            break;
                        }
                    }
                }
            }
        });
    }

    /**
     * Executes a promise that will wait for some specified amount of time by using timeout.
     * @param {number} ms The wait time in milliseconds.
     * @return {Promise}
     */
    public static async sleep(ms: number): Promise<void> {
        return new Promise((resolve => setTimeout(resolve, ms)));
    }

    /**
     * Combine the base URL with the URL's suffix.
     * @param {string} baseUrl The base URL.
     * @param {string} suffix The suffix.
     * @return {string} representing the concatenated URL.
     */
    private static Combine(baseUrl: string, suffix: string): string {
        baseUrl = baseUrl.replace(/^[\/]+|[\/]+$/g, '');
        suffix = suffix.replace(/^[\/]+|[\/]+$/g, '');
        return `${baseUrl}/${suffix}`;
    }

    /**
     * Races an async task (network request) against timeout and returns the winner.
     * @param {number} ms The time in milliseconds.
     * @param {Promise} promise The promise that is competing against the timeout promise.
     * @return {Promise} which one the race.
     */
    private raceAsyncTaskAgainstTimeout(ms: number, promise: Promise<CdmHttpResponse>): Promise<CdmHttpResponse> {

        const timeout = new Promise<CdmHttpResponse>((resolve, reject) => {
            const t = setTimeout(() => {
                clearTimeout(t);
                reject('Timed out.');
            }, ms);
        });

        return Promise.race([
            promise,
            timeout
        ]);
    }
}
