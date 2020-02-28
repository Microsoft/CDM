// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import {
    CdmArgumentDefinition,
    CdmAttributeContext,
    CdmAttributeContextReference,
    CdmAttributeGroupDefinition,
    CdmAttributeGroupReference,
    CdmAttributeReference,
    CdmAttributeResolutionGuidance,
    CdmConstantEntityDefinition,
    CdmDataPartitionDefinition,
    CdmDataPartitionPatternDefinition,
    CdmDataTypeDefinition,
    CdmDataTypeReference,
    CdmDocumentDefinition,
    CdmE2ERelationship,
    CdmEntityAttributeDefinition,
    CdmEntityDefinition,
    CdmEntityReference,
    CdmFolderDefinition,
    CdmImport,
    CdmLocalEntityDeclarationDefinition,
    CdmManifestDeclarationDefinition,
    CdmManifestDefinition,
    CdmObject,
    cdmObjectType,
    CdmParameterDefinition,
    CdmPurposeDefinition,
    CdmPurposeReference,
    CdmReferencedEntityDeclarationDefinition,
    CdmTraitDefinition,
    CdmTraitReference,
    CdmTypeAttributeDefinition
} from '../internal';

export function isImport(obj: CdmObject): obj is CdmImport {
    return obj && obj.objectType === cdmObjectType.import;
}

export function isArgument(obj: CdmObject): obj is CdmArgumentDefinition {
    return obj && obj.objectType === cdmObjectType.argumentDef;
}

export function isParameterDefinition(obj: CdmObject): obj is CdmParameterDefinition {
    return obj && obj.objectType === cdmObjectType.parameterDef;
}

export function isCdmTraitDefinition(obj: CdmObject): obj is CdmTraitDefinition {
    return obj && obj.objectType === cdmObjectType.traitDef;
}

export function isCdmTraitReference(obj: CdmObject): obj is CdmTraitReference {
    return obj && obj.objectType === cdmObjectType.traitRef;
}

export function isPurposeDefinition(obj: CdmObject): obj is CdmPurposeDefinition {
    return obj && obj.objectType === cdmObjectType.purposeDef;
}

export function isPurposeReference(obj: CdmObject): obj is CdmPurposeReference {
    return obj && obj.objectType === cdmObjectType.purposeRef;
}

export function isDataTypeDefinition(obj: CdmObject): obj is CdmDataTypeDefinition {
    return obj && obj.objectType === cdmObjectType.dataTypeDef;
}

export function isDataTypeReference(obj: CdmObject): obj is CdmDataTypeReference {
    return obj && obj.objectType === cdmObjectType.purposeRef;
}

export function isAttributeReference(obj: CdmObject): obj is CdmAttributeReference {
    return obj && obj.objectType === cdmObjectType.attributeRef;
}

export function isTypeAttributeDefinition(obj: CdmObject): obj is CdmTypeAttributeDefinition {
    return obj && obj.objectType === cdmObjectType.typeAttributeDef;
}

export function isEntityAttributeDefinition(obj: CdmObject): obj is CdmEntityAttributeDefinition {
    return obj && obj.objectType === cdmObjectType.entityAttributeDef;
}

export function isAttributeGroupDefinition(obj: CdmObject): obj is CdmAttributeGroupDefinition {
    return obj && obj.objectType === cdmObjectType.attributeGroupDef;
}

export function isAttributeGroupReference(obj: CdmObject): obj is CdmAttributeGroupReference {
    return obj && obj.objectType === cdmObjectType.attributeGroupRef;
}

export function isConstantEntityDefinition(obj: CdmObject): obj is CdmConstantEntityDefinition {
    return obj && obj.objectType === cdmObjectType.constantEntityDef;
}

export function isEntityDefinition(obj: CdmObject): obj is CdmEntityDefinition {
    return obj && obj.objectType === cdmObjectType.entityDef;
}

export function isEntityReference(obj: CdmObject): obj is CdmEntityReference {
    return obj && obj.objectType === cdmObjectType.entityRef;
}

export function isDocumentDefinition(obj: CdmObject): obj is CdmDocumentDefinition {
    return obj && obj.objectType === cdmObjectType.documentDef;
}

export function isManifestDefinition(obj: CdmObject): obj is CdmManifestDefinition {
    return obj && obj.objectType === cdmObjectType.manifestDef;
}

export function isFolderDefinition(obj: CdmObject): obj is CdmFolderDefinition {
    return obj && obj.objectType === cdmObjectType.folderDef;
}

export function isAttributeContextDefinition(obj: CdmObject): obj is CdmAttributeContext {
    return obj && obj.objectType === cdmObjectType.attributeContextDef;
}

export function isAttributeContextReference(obj: CdmObject): obj is CdmAttributeContextReference {
    return obj && obj.objectType === cdmObjectType.attributeContextRef;
}

export function isManifestDeclarationDefinition(obj: CdmObject): obj is CdmManifestDeclarationDefinition {
    return obj && obj.objectType === cdmObjectType.manifestDeclarationDef;
}

export function isLocalEntityDeclarationDefinition(obj: CdmObject): obj is CdmLocalEntityDeclarationDefinition {
    return obj && obj.objectType === cdmObjectType.localEntityDeclarationDef;
}

export function isReferencedEntityDeclarationDefinition(obj: CdmObject): obj is CdmReferencedEntityDeclarationDefinition {
    return obj && obj.objectType === cdmObjectType.referencedEntityDeclarationDef;
}

export function isDataPartition(obj: CdmObject): obj is CdmDataPartitionDefinition {
    return obj && obj.objectType === cdmObjectType.dataPartitionDef;
}

export function isDataPartitionPattern(obj: CdmObject): obj is CdmDataPartitionPatternDefinition {
    return obj && obj.objectType === cdmObjectType.dataPartitionPatternDef;
}

export function isAttributeResolutionGuidance(obj: CdmObject): obj is CdmAttributeResolutionGuidance {
    return obj && obj.objectType === cdmObjectType.attributeResolutionGuidanceDef;
}

export function isE2ERelationship(obj: CdmObject): obj is CdmE2ERelationship {
    return obj && obj.objectType === cdmObjectType.e2eRelationshipDef;
}
