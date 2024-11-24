import { ContainerDefinition, Policy } from "./policy";
import ContextualIdentity = browser.contextualIdentities.ContextualIdentity;
import { z } from "zod";

//TODO: Remove this.  Instead of using this prefix to manage what I should control I should have the config contain a list
// of containers to exempt
export const managedContainerPrefix = "__managedContainersv1-";

interface ToUpdateEntry {
  cookieStoreId: string;
  newValue: z.infer<typeof ContainerDefinition>;
}

interface PolicyEvalResults {
  // A list of container definitions to set up
  toAdd: Array<z.infer<typeof ContainerDefinition>>;
  // A list of cookie store IDs to remove
  toRemove: Array<string>;
  // A list of containers that have drifted from policy.  Update them
  toUpdate: Array<ToUpdateEntry>;
}
export function buildContainerDifference(
  policy: z.infer<typeof Policy>,
  identities: ContextualIdentity[],
): PolicyEvalResults {
  const filteredExistingIdentities = identities
    .filter((identity) => {
      return identity.name.startsWith(managedContainerPrefix);
    })
    .reduce((acc, v) => {
      acc.set(v.name, v);
      return acc;
    }, new Map<string, ContextualIdentity>());
  let containers: Array<z.infer<typeof ContainerDefinition>> = [];
  if (policy.containers) {
    containers = policy.containers;
  } else {
    containers = [];
  }
  const toAdd: Array<z.infer<typeof ContainerDefinition>> = [];
  const toUpdate = [];
  for (const container of containers) {
    const fullName = managedContainerPrefix + container.name;
    const configuredContainer = filteredExistingIdentities.get(fullName);
    if (!configuredContainer) {
      toAdd.push(container);
    } else {
      filteredExistingIdentities.delete(fullName);
      if (
        configuredContainer.color != container.color ||
        configuredContainer.icon != container.icon
      ) {
        toUpdate.push({
          cookieStoreId: configuredContainer.cookieStoreId,
          newValue: container,
        });
      }
    }
  }
  const toRemove = [];
  for (const entry of filteredExistingIdentities.values()) {
    // If the exists in both the policy and configured containers, we removed it from filteredExistingIdentities. All
    // that is left is configured values that aren't in policy, IE things that need to be deleted
    toRemove.push(entry.cookieStoreId);
  }

  return {
    toAdd: toAdd,
    toRemove: toRemove,
    toUpdate: toUpdate,
  };
}
