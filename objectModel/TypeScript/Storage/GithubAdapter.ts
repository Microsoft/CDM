// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { CdmHttpClient, CdmHttpRequest, CdmHttpResponse } from '../Utilities/Network';
import { NetworkAdapter } from './NetworkAdapter';
import { configObjectType, StorageAdapter } from './StorageAdapter';

export class GithubAdapter extends NetworkAdapter implements StorageAdapter {
    private static readonly ghHost: string = 'raw.githubusercontent.com';
    private static readonly ghPath: string = '/Microsoft/CDM/master/schemaDocuments';
    /**
     * @internal
     */
    public readonly type: string = 'github';
    public locationHint: string;

    private readonly url: string;

    constructor() {
        super();

        this.httpClient = new CdmHttpClient(`https://${GithubAdapter.ghHost}`);
    }

    private static ghRawRoot(): string {

        return `https://${this.ghHost}${this.ghPath}`;
    }

    public canRead(): boolean {
        return true;
    }

    public async readAsync(corpusPath: string): Promise<string> {
        const cdmHttpRequest: CdmHttpRequest =
            this.setUpCdmRequest(
                `${GithubAdapter.ghPath}${corpusPath}`,
                new Map<string, string>(),
                'GET'
            );

        const cdmHttpResponse: CdmHttpResponse = await super.executeRequest(cdmHttpRequest);

        return cdmHttpResponse.content;
    }

    public canWrite(): boolean {
        throw new Error('Method not implemented.');
    }

    public async writeAsync(corpusPath: string, data: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public createAdapterPath(corpusPath: string): string {
        return `${GithubAdapter.ghRawRoot()}${corpusPath}`;
    }

    public createCorpusPath(adapterPath: string): string {
        const ghRoot: string = GithubAdapter.ghRawRoot();
        // might not be an adapterPath that we understand. check that first
        if (ghRoot && adapterPath.startsWith(ghRoot)) {
            return adapterPath.slice(ghRoot.length);
        }

        return undefined;
    }

    public async computeLastModifiedTimeAsync(corpusPath: string): Promise<Date> {
        return new Date();
    }

    public async fetchAllFilesAsync(currFullPath: string): Promise<string[]> {
        return undefined;
    }

    public clearCache(): void {}

    public fetchConfig(): string {
        const resultConfig: configObjectType = {
            type: this.type
        };

        // Construct network configs.
        const configObject: configObjectType = this.fetchNetworkConfig();

        if (this.locationHint) {
            configObject.locationHint = this.locationHint;
        }

        resultConfig.config = configObject;

        return JSON.stringify(resultConfig);
    }

    public updateConfig(config: string): void {
        if (!config) {
            // It is fine just to skip it for GitHub adapter.
            return;
        }

        this.updateNetworkConfig(config);

        const configJson: configObjectType = JSON.parse(config);

        if (configJson.locationHint) {
            this.locationHint = JSON.stringify(configJson.locationHint);
        }
    }
}

interface FileInfo {
    // fill this in with things we need about the file
    // size? date/time modified?
}
