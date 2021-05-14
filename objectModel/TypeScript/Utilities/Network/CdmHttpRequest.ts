// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { Guid } from 'guid-typescript';

/**
 * The CDM Http request class that is being used by CDM Http client to execute network requests.
 */
export class CdmHttpRequest {

    /**
     * The headers.
     */
    public headers: Map<string, string>;

    /**
     * The content.
     */
    public content: string;

    /**
     * The content type.
     */
    public contentType: string;

    /**
     * The HTTP method.
     */
    public method: string;

    /**
     * The request URL (can be partial or full), depends on whether the client has URL set.
     */
    public requestedUrl: string;

    /**
     *The unique id of the request for logging.
     */
    public requestId: string;

    /**
     * The timeout of a single request in milliseconds.
     */
    public timeout?: number;

    /**
     * The timeout of all of the requests in milliseconds.
     */
    public maximumTimeout?: number;

    /**
     * The number of retries.
     */
    public numberOfRetries: number;

    constructor(url: string, numberOfRetries: number = 0, method?: string) {
        this.headers = new Map<string, string>();
        this.requestedUrl = url;
        this.requestId = Guid.create().toString();
        this.numberOfRetries = numberOfRetries;

        // If there is no HTTP method specified, assume GET.
        if (method === undefined) {
            this.method = 'GET';
        } else {
            this.method = method;
        }
    }

    /**
     * Strips sas token parameter 'sig'.
     * @returns The requested url with the value of 'sig' replaced with 'REMOVED'.
     * @deprecated Only for internal use.
     */
    public stripSasSig() : string {
        const sigStartIndex : number = this.requestedUrl.indexOf('sig=');
        if (sigStartIndex == -1) {
            return this.requestedUrl;
        }

        var sigEndIndex : number = this.requestedUrl.indexOf('&', sigStartIndex + 1);
        sigEndIndex = sigEndIndex == -1 ? this.requestedUrl.length : sigEndIndex;
        return this.requestedUrl.substring(0, sigStartIndex + 4) + 'REMOVED' + this.requestedUrl.substring(sigEndIndex);
    }
}
