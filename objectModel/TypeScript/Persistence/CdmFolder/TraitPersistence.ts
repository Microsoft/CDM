// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { CdmFolder } from '..';
import {
    CdmCorpusContext,
    cdmObjectType,
    CdmTraitDefinition,
    copyOptions,
    resolveOptions
} from '../../internal';
import * as copyDataUtils from '../../Utilities/CopyDataUtils';
import {
    Parameter,
    Trait,
    TraitReference
} from './types';

export class TraitPersistence {
    public static fromData(ctx: CdmCorpusContext, object: Trait): CdmTraitDefinition {
        const trait: CdmTraitDefinition = ctx.corpus.MakeObject(cdmObjectType.traitDef, object.traitName);

        if (object.extendsTrait) {
            trait.extendsTrait = CdmFolder.TraitReferencePersistence.fromData(ctx, object.extendsTrait);
        }

        if (object.explanation) {
            trait.explanation = object.explanation;
        }

        if (object.hasParameters) {
            object.hasParameters.forEach((ap: string | Parameter) => {
                if (typeof (ap) !== 'string') {
                    trait.parameters.push(CdmFolder.ParameterPersistence.fromData(ctx, ap));
                }
            });
        }

        if (object.elevated !== undefined) {
            trait.elevated = object.elevated;
        }
        if (object.ugly !== undefined) {
            trait.ugly = object.ugly;
        }
        if (object.associatedProperties) {
            trait.associatedProperties = object.associatedProperties;
        }

        return trait;
    }
    public static toData(instance: CdmTraitDefinition, resOpt: resolveOptions, options: copyOptions): Trait {
        const result : Trait =  {
            traitName: instance.traitName,
            extendsTrait: instance.extendsTrait ? instance.extendsTrait.copyData(resOpt, options) as (string | TraitReference) : undefined,
            hasParameters: copyDataUtils.arrayCopyData<string | Parameter>(resOpt, instance.parameters, options)
        };

        if (instance.associatedProperties !== undefined) {
            result.associatedProperties = instance.associatedProperties;
        }

        if (instance.elevated !== undefined) {
            result.elevated = instance.elevated;
        }

        if (instance.explanation !== undefined) {
            result.explanation = instance.explanation;
        }

        if (instance.ugly !== undefined) {
            result.ugly = instance.ugly;
        }

        return result;
    }
}
