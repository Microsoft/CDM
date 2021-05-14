// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

package com.microsoft.commondatamodel.objectmodel.cdm.projections;

import com.microsoft.commondatamodel.objectmodel.cdm.*;
import com.microsoft.commondatamodel.objectmodel.enums.CdmObjectType;
import com.microsoft.commondatamodel.objectmodel.enums.CdmOperationType;
import com.microsoft.commondatamodel.objectmodel.resolvedmodel.*;
import com.microsoft.commondatamodel.objectmodel.resolvedmodel.projections.ProjectionAttributeStateSet;
import com.microsoft.commondatamodel.objectmodel.resolvedmodel.projections.ProjectionContext;
import com.microsoft.commondatamodel.objectmodel.utilities.*;

import java.util.List;

/**
 * Base class for all operations
 */
public abstract class CdmOperationBase extends CdmObjectDefinitionBase {
    private int index;
    private CdmOperationType type;
    private String condition;
    private Boolean sourceInput;

    public CdmOperationBase(final CdmCorpusContext ctx) {
        super(ctx);
    }

    /**
     * The index of an operation
     * In a projection's operation collection, 2 same type of operation may cause duplicate attribute context
     * To avoid that we add an index
     *
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     * @return int index
     */
    @Deprecated
    public int getIndex() {
        return index;
    }

    /**
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     * @param index Int Index
     */
    @Deprecated
    public void setIndex(final int index) {
        this.index = index;
    }

    public CdmOperationType getType() {
        return type;
    }

    /**
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     * @param type CdmOperationType
     */
    @Deprecated
    public void setType(final CdmOperationType type) {
        this.type = type;
    }

    /**
     * Property of an operation that holds the condition expression string
     * @return String
     */
    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    /**
     * Property of an operation that defines if the operation receives the input from previous operation or from source entity
     * @return Boolean
     */
    public Boolean getSourceInput() {
        return sourceInput;
    }

    public void setSourceInput(Boolean sourceInput) {
        this.sourceInput = sourceInput;
    }

    @Override
    public abstract CdmObject copy(ResolveOptions resOpt, CdmObject host);


    
    /** 
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     * @param resOpt Resolved options
     * @param options Copy options
     * @return Object
     */
    @Override
    @Deprecated
    public abstract Object copyData(final ResolveOptions resOpt, final CopyOptions options);

    @Override
    public abstract String getName();

    /**
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     */
    @Override
    @Deprecated
    public abstract CdmObjectType getObjectType();

    @Override
    public boolean isDerivedFrom(final String baseDef, ResolveOptions resOpt) {
        return false;
    }

    @Override
    public abstract boolean validate();

    @Override
    public abstract boolean visit(final String pathFrom, final VisitCallback preChildren, final VisitCallback postChildren);

    /**
     * A function to cumulate the projection attribute states
     *
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     * @param projCtx ProjectionContext 
     * @param projAttrStateSet ProjectionAttributeStateSet 
     * @param attrCtx CdmAttributeContext
     * @return ProjectionAttributeStateSet
     */
    @Deprecated
    public abstract ProjectionAttributeStateSet appendProjectionAttributeState(ProjectionContext projCtx, ProjectionAttributeStateSet projAttrStateSet, CdmAttributeContext attrCtx);

    /**
     * Projections require a new resolved attribute to be created multiple times
     * This function allows us to create new resolved attributes based on a input attribute
     *
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     * @param projCtx ProjectionContext
     * @param attrCtxUnder CdmAttributeContext
     * @param targetAttr CdmAttribute
     * @return ResolvedAttribute
     */
    @Deprecated
    public static ResolvedAttribute createNewResolvedAttribute(ProjectionContext projCtx, CdmAttributeContext attrCtxUnder, CdmAttribute targetAttr) {
        return createNewResolvedAttribute(projCtx, attrCtxUnder, targetAttr, null);
    }

    /**
     * Projections require a new resolved attribute to be created multiple times
     * This function allows us to create new resolved attributes based on a input attribute
     *
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     * @param projCtx ProjectionContext
     * @param attrCtxUnder CdmAttributeContext
     * @param targetAttr CdmAttribute
     * @param overrideDefaultName String
     * @return ResolvedAttribute
     */
    @Deprecated
    public static ResolvedAttribute createNewResolvedAttribute(ProjectionContext projCtx, CdmAttributeContext attrCtxUnder, CdmAttribute targetAttr, String overrideDefaultName) {
        return createNewResolvedAttribute(projCtx, attrCtxUnder, targetAttr, overrideDefaultName, null);
    }


    
    /** 
     * Projections require a new resolved attribute to be created multiple times
     * This function allows us to create new resolved attributes based on a input attribute
     *
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     * @param projCtx ProjectionContext
     * @param attrCtxUnder CdmAttributeContext
     * @param targetAttr CdmAttribute
     * @param overrideDefaultName String
     * @param addedSimpleRefTraits List of String
     * @return ResolvedAttribute
     */
    @Deprecated
    public static ResolvedAttribute createNewResolvedAttribute(ProjectionContext projCtx, CdmAttributeContext attrCtxUnder, CdmAttribute targetAttr, String overrideDefaultName, List<String> addedSimpleRefTraits) {
        targetAttr = (CdmAttribute) targetAttr.copy();

        ResolvedAttribute newResAttr = new ResolvedAttribute(
                projCtx.getProjectionDirective().getResOpt(),
                targetAttr,
                !StringUtils.isNullOrTrimEmpty(overrideDefaultName) ? overrideDefaultName : targetAttr.getName(), attrCtxUnder);

        targetAttr.setInDocument(projCtx.getProjectionDirective().getOwner().getInDocument());

        if (addedSimpleRefTraits != null) {
            for (String trait : addedSimpleRefTraits) {
                if (targetAttr.getAppliedTraits().item(trait) == null) {
                    targetAttr.getAppliedTraits().add(trait, true);
                }
            }
        }

        ResolvedTraitSet resTraitSet = targetAttr.fetchResolvedTraits(projCtx.getProjectionDirective().getResOpt());

        // Create deep a copy of traits to avoid conflicts in case of parameters
        if (resTraitSet != null) {
            newResAttr.setResolvedTraits(resTraitSet.deepCopy());
        }

        return newResAttr;
    }
}
