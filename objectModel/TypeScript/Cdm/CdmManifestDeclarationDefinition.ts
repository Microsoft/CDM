// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import {
    CdmAttributeContext,
    CdmCorpusContext,
    CdmFileStatus,
    CdmObject,
    CdmObjectDefinitionBase,
    cdmObjectType,
    ResolvedAttributeSetBuilder,
    ResolvedTraitSetBuilder,
    resolveOptions,
    VisitCallback
} from '../internal';
import * as timeUtils from '../Utilities/timeUtils';

/**
 * The object model implementation for Manifest Declaration.
 */
export class CdmManifestDeclarationDefinition extends CdmObjectDefinitionBase implements CdmManifestDeclarationDefinition, CdmFileStatus {

    public static get objectType(): cdmObjectType {
        return cdmObjectType.manifestDeclarationDef;
    }

    /**
     * @inheritdoc
     */
    public manifestName: string;

    /**
     * @inheritdoc
     */
    public definition: string;

    /**
     * @inheritdoc
     */
    public lastFileStatusCheckTime: Date;

    /**
     * @inheritdoc
     */
    public lastFileModifiedTime: Date;

    /**
     * Initializes a new instance of the manifest declaration impl object.
     * @param ctx The context.
     * @param name The manifest name.
     */
    constructor(ctx: CdmCorpusContext, name: string) {

        super(ctx);

        this.objectType = cdmObjectType.manifestDeclarationDef;
        this.manifestName = name;
    }

    /**
     * @inheritdoc
     */
    public getObjectType(): cdmObjectType {
        return cdmObjectType.manifestDeclarationDef;
    }

    /**
     * @inheritdoc
     */
    public copy(resOpt?: resolveOptions, host?: CdmObject): CdmObject {
        if (!resOpt) {
            resOpt = new resolveOptions(this);
        }
        let copy: CdmManifestDeclarationDefinition;
        if (!host) {
            copy = new CdmManifestDeclarationDefinition(this.ctx, this.manifestName);
        } else {
            copy = host as CdmManifestDeclarationDefinition;
            copy.ctx = this.ctx;
            copy.manifestName = this.manifestName;
        }
        copy.definition = this.definition;
        copy.lastFileStatusCheckTime = copy.lastFileStatusCheckTime;
        copy.lastFileModifiedTime = copy.lastFileModifiedTime;
        this.copyDef(resOpt, copy);

        return copy;
    }

    /**
     * @inheritdoc
     */
    public validate(): boolean {
        return this.manifestName && this.definition ? true : false;
    }

    /**
     * @inheritdoc
     */
    public getName(): string {
        return this.manifestName;
    }

    /**
     * @inheritdoc
     */
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean {
        let path: string = '';
        if (this.ctx.corpus.blockDeclaredPathChanges === false) {
            path = this.declaredPath;
            if (path === undefined) {
                path = pathFrom + this.getName();
                this.declaredPath = path;
            }
        }

        if (preChildren && preChildren(this, path)) {
            return false;
        }

        if (this.visitDef(path, preChildren, postChildren)) {
            return true;
        }

        if (postChildren && postChildren(this, path)) {
            return false;
        }

        return false;
    }

    /**
     * @inheritdoc
     */
    public isDerivedFrom(base: string, resOpt?: resolveOptions): boolean {
        if (!resOpt) {
            resOpt = new resolveOptions(this);
        }

        return false; // makes no sense
    }

    /**
     * @inheritdoc
     * @internal
     */
    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder, resOpt: resolveOptions): void {
        return;
    }

    /**
     * @inheritdoc
     * @internal
     */
    public constructResolvedAttributes(resOpt: resolveOptions, under?: CdmAttributeContext): ResolvedAttributeSetBuilder {
        return undefined;
    }

    /**
     * @inheritdoc
     */
    public async fileStatusCheckAsync(): Promise<void> {
        const fullPath: string  = this.ctx.corpus.storage.createAbsoluteCorpusPath(this.definition, this.inDocument);
        const modifiedTime: Date = await this.ctx.corpus.computeLastModifiedTimeAsync(fullPath, this);

        this.lastFileStatusCheckTime = new Date();
        this.lastFileModifiedTime = timeUtils.maxTime(modifiedTime, this.lastFileModifiedTime);

        await this.reportMostRecentTimeAsync(this.lastFileModifiedTime);
    }

    /**
     * @inheritdoc
     */
    public async reportMostRecentTimeAsync(childTime: Date): Promise<void> {
        if ((this.owner as CdmFileStatus).reportMostRecentTimeAsync && childTime) {
            await (this.owner as CdmFileStatus).reportMostRecentTimeAsync(childTime);
        }
    }
}
