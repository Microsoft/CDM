// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

package com.microsoft.commondatamodel.objectmodel.resolvedmodel.projections;

import com.microsoft.commondatamodel.objectmodel.cdm.CdmAttributeContext;
import com.microsoft.commondatamodel.objectmodel.enums.CdmAttributeContextType;
import com.microsoft.commondatamodel.objectmodel.resolvedmodel.ResolvedAttribute;
import com.microsoft.commondatamodel.objectmodel.utilities.AttributeContextParameters;
import com.microsoft.commondatamodel.objectmodel.utilities.StringUtils;

import java.util.*;

/**
 * Attribute context tree builder for projection operations that involve a search for a previously held attribute name.
 * There are three types of attribute context nodes created out of such operations:
 *
 *     Search For:
 *         The name of the attribute to search for, whether it's the current name of the attribute or a previously held name.
 *         Ex. A name in the "includeAttributes" list (for Include) or the name specified in "applyTo" (for Rename)
 *
 *     Found:
 *         The name of the attribute that was found out of the search for name. Because this is the current name of the attribute,
 *         the search for name and the found name can be different. The search for name can return multiple found names.
 *         Ex. Given Rename(A->a) and then Include(A), searchFor = "A" and found = "a"
 *
 *     Action:
 *         The name of the attribute resulting out of the action (operation).
 *         Ex. Given Rename(A->a), the action/operation is to rename "A" to "a" so action (the resulting attribute) = "a"
 *
 * Put together, the resulting attribute context will look like "../operation/index{n}/[name of operation]/[searchFor]/[found]/[action]"
 *     Ex. ../operation/index1/operationRenameAttributes/A/a/aa, given searchFor = "A", found = "a", action = "aa"
 *
 * If searchFor and found or found and action have the same name, then we just collapse the nodes
 *     Ex. ../operation/index1/operationRenameAttributes/A/a/a -> ../operation/index1/operationRenameAttributes/A/a/
 *     Ex. ../operation/index1/operationIncludeAttributes/B/B -> ../operation/index1/operationIncludeAttributes/B
 *
 * @deprecated This class is extremely likely to be removed in the public interface, and not
 * meant to be called externally at all. Please refrain from using it.
 */
@Deprecated
public class ProjectionAttributeContextTreeBuilder {
    /**
     * Root node to build the attribute context tree under
     */
    private CdmAttributeContext root;

    /**
     * Mapping between a "search for" string to the attribute context parameter created out of it
     */
    private Map<String, AttributeContextParameters> searchForToSearchForAttrCtxParam;

    /**
     * Mapping between a "search for" attribute context parameter to all attribute context parameters created out of the
     * "found" attributes
     */
    private Map<AttributeContextParameters, List<AttributeContextParameters>> searchForAttrCtxParamToFoundAttrCtxParam;

    /**
     * Mapping between a "found" attribute context parameter to the attribute context parameter created out of the
     * "action" attribute
     */
    private Map<AttributeContextParameters, AttributeContextParameters> foundAttrCtxParamToActionAttrCtxParam;

    /**
     * Mapping between an "action" attribute context parameter to the resolved attribute resulting out of the action
     */
    private Map<AttributeContextParameters, ResolvedAttribute> actionAttrCtxParamToResAttr;

    public ProjectionAttributeContextTreeBuilder(CdmAttributeContext root) {
        this.root = root;
        this.searchForToSearchForAttrCtxParam = new LinkedHashMap<>();
        this.searchForAttrCtxParamToFoundAttrCtxParam = new LinkedHashMap<>();
        this.foundAttrCtxParamToActionAttrCtxParam = new LinkedHashMap<>();
        this.actionAttrCtxParamToResAttr = new LinkedHashMap<>();
    }

    /**
     * Creates the attribute context parameters for the searchFor, found, and action nodes and then stores them in different maps.
     * The maps are used when constructing the actual attribute context tree.
     *
     * @param searchFor The "search for" string
     * @param found The projection attribute state that contains the "found" attribute
     * @param resAttrFromAction The resolved attribute that resulted from the action
     * @param attrCtxType The attribute context type to give the "action" attribute context parameter
     *
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     */
    @Deprecated
    public void createAndStoreAttributeContextParameters(String searchFor, ProjectionAttributeState found, ResolvedAttribute resAttrFromAction, CdmAttributeContextType attrCtxType) {
        // searchFor is null when we have to construct attribute contexts for the excluded attributes in Include or the included attributes in Exclude,
        // as these attributes weren't searched for with a searchFor name.
        // If searchFor is null, just set it to have the same name as found so that it'll collapse in the final tree.
        if (searchFor == null) {
            searchFor = found.getCurrentResolvedAttribute().getResolvedName();
        }

        // Create the attribute context parameter for the searchFor node and store it in the map as [searchFor name]:[attribute context parameter]
        AttributeContextParameters searchForAttrCtxParam = null;
        if (!searchForToSearchForAttrCtxParam.containsKey(searchFor)) {
            searchForAttrCtxParam = new AttributeContextParameters();
            searchForAttrCtxParam.setUnder(root);
            searchForAttrCtxParam.setType(CdmAttributeContextType.AttributeDefinition);
            searchForAttrCtxParam.setName(searchFor);

            searchForToSearchForAttrCtxParam.put(searchFor, searchForAttrCtxParam);
        } else {
            searchForAttrCtxParam = searchForToSearchForAttrCtxParam.get(searchFor);
        }

        // Create the attribute context parameter for the found node
        AttributeContextParameters foundAttrCtxParam = new AttributeContextParameters();
        foundAttrCtxParam.setUnder(root); // Set this to be under the root for now, as we may end up collapsing this node
        foundAttrCtxParam.setType(CdmAttributeContextType.AttributeDefinition);
        foundAttrCtxParam.setName(found.getCurrentResolvedAttribute().getResolvedName() + (found.getOrdinal() != null ? "@" + found.getOrdinal().toString() : ""));

        // Store this in the map as [searchFor attribute context parameter]:[found attribute context parameters]
        // We store it this way so that we can create the found nodes under their corresponding searchFor nodes.
        if (!searchForAttrCtxParamToFoundAttrCtxParam.containsKey(searchForAttrCtxParam)) {
            searchForAttrCtxParamToFoundAttrCtxParam.put(searchForAttrCtxParam, new ArrayList<>(Arrays.asList(foundAttrCtxParam)));
        } else {
            List<AttributeContextParameters> foundAttrCtxParams = searchForAttrCtxParamToFoundAttrCtxParam.get(searchForAttrCtxParam);
            foundAttrCtxParams.add(foundAttrCtxParam);
            searchForAttrCtxParamToFoundAttrCtxParam.put(searchForAttrCtxParam, foundAttrCtxParams);
        }

        // Create the attribute context parameter for the action node
        AttributeContextParameters actionAttrCtxParam = new AttributeContextParameters();
        actionAttrCtxParam.setUnder(root); // Set this to be under the root for now, as we may end up collapsing this node
        actionAttrCtxParam.setType(attrCtxType); // This type will be updated once we implement the new attribute context types
        actionAttrCtxParam.setName(resAttrFromAction.getResolvedName());

        // Store this in the map as [found attribute context parameter]:[action attribute context parameter]
        // We store it this way so that we can create the action nodes under their corresponding found nodes.
        foundAttrCtxParamToActionAttrCtxParam.put(foundAttrCtxParam, actionAttrCtxParam);

        // Store the action attribute context parameter with the resolved attribute resulting out of the action.
        // This is so that we can point the action attribute context to the correct resolved attribute once the attribute context is created.
        actionAttrCtxParamToResAttr.put(actionAttrCtxParam, resAttrFromAction);
    }

    /**
     * Takes all the stored attribute context parameters, creates attribute contexts from them, and then constructs the tree.
     *
     * @param projCtx The projection context
     *
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     */
    @Deprecated
    public void constructAttributeContextTree(ProjectionContext projCtx) {
        constructAttributeContextTree(projCtx, false);
    }

    /**
     * Takes all the stored attribute context parameters, creates attribute contexts from them, and then constructs the tree.
     *
     * @param projCtx The projection context
     * @param setAttrCtx Whether to set the created attribute context on the associated resolved attribute
     *
     * @deprecated This function is extremely likely to be removed in the public interface, and not
     * meant to be called externally at all. Please refrain from using it.
     */
    @Deprecated
    public void constructAttributeContextTree(ProjectionContext projCtx, boolean setAttrCtx) {
        // Iterate over all the searchFor attribute context parameters
        for (AttributeContextParameters searchForAttrCtxParam : this.searchForToSearchForAttrCtxParam.values()) {
            CdmAttributeContext searchForAttrCtx = null;

            // Fetch all the found attribute context parameters associated with this searchFor
            List<AttributeContextParameters> foundAttrCtxParams = searchForAttrCtxParamToFoundAttrCtxParam.get(searchForAttrCtxParam);

            // Iterate over all the found attribute context parameters
            for (AttributeContextParameters foundAttrCtxParam : foundAttrCtxParams)
            {
                // We should only create the searchFor node when searchFor and found have different names. Else collapse the nodes together.
                if (!StringUtils.equalsWithCase(searchForAttrCtxParam.getName(), foundAttrCtxParam.getName())) {
                    // Create the attribute context for searchFor if it hasn't been created already and set it as the parent of found
                    if (searchForAttrCtx == null) {
                        searchForAttrCtx = CdmAttributeContext.createChildUnder(projCtx.getProjectionDirective().getResOpt(), searchForAttrCtxParam);
                    }
                    foundAttrCtxParam.setUnder(searchForAttrCtx);
                }

                // Fetch the action attribute context parameter associated with this found
                AttributeContextParameters actionAttrCtxParam = foundAttrCtxParamToActionAttrCtxParam.get(foundAttrCtxParam);

                // We should only create the found node when found and action have different names. Else collapse the nodes together.
                if (!StringUtils.equalsWithCase(foundAttrCtxParam.getName(), actionAttrCtxParam.getName())) {
                    // Create the attribute context for found and set it as the parent of action
                    CdmAttributeContext foundAttrCtx = CdmAttributeContext.createChildUnder(projCtx.getProjectionDirective().getResOpt(), foundAttrCtxParam);
                    actionAttrCtxParam.setUnder(foundAttrCtx);
                }

                // Create the attribute context for action
                CdmAttributeContext actionAttrCtx = CdmAttributeContext.createChildUnder(projCtx.getProjectionDirective().getResOpt(), actionAttrCtxParam);

                // Fetch the resolved attribute that should now point at this action attribute context
                ResolvedAttribute resAttrFromAction = actionAttrCtxParamToResAttr.get(actionAttrCtxParam);

                // TODO (jibyun): For now, only set the created attribute context on the resolved attribute when specified to,
                // as pointing the resolved attribute at this attribute context won't work currently for certain operations (Include/Exclude).
                // This will be changed to always run once we work on the attribute context fix.
                if (setAttrCtx) {
                    resAttrFromAction.setAttCtx(actionAttrCtx);
                }
            }
        }
    }
}
