import { ContainerDefinition, Policy } from "./policy";
import ContextualIdentity = browser.contextualIdentities.ContextualIdentity;
import { z } from "zod";
const managedContainerPrefix = "__managedContainers-";

interface PolicyEvalResults {
  toAdd: Array<typeof ContainerDefinition>;
}
function buildDifference(
  policy: z.infer<typeof Policy>,
  identities: ContextualIdentity[],
): PolicyEvalResults {
  const filteredExistingIdentities = identities
    .filter((identity) => {
      identity.name.startsWith(managedContainerPrefix);
    })
    .reduce((acc, v) => {
      acc.set(v.name, v);
      return acc;
    }, new Map<string, ContextualIdentity>());
  let containers: typeof policy.containers;
  if (policy.containers) {
    containers = policy.containers;
  } else {
    containers = [];
  }
  const toAdd = [];
  const toUpdate = [];
  for (const container of containers) {
    const fullName = managedContainerPrefix + container.name;
    const configuredContainer = filteredExistingIdentities.get(fullName);
    if (configuredContainer == undefined) {
      toAdd.push(container);
    } else {
      filteredExistingIdentities.delete(fullName);
      if (
        configuredContainer.color != container.color ||
        configuredContainer.icon != container.icon
      ) {
        toUpdate.push((configuredContainer.cookieStoreId, container));
      }
    }
  }
  const toDelete = [];
  for (const entry of filteredExistingIdentities.values()) {
    // If the exists in both the policy and configured containers, we removed it from filteredExistingIdentities. All
    // that is left is configured values that aren't in policy, IE things that need to be deleted
    toDelete.push(entry.cookieStoreId);
  }

  return {
    toAdd: toAdd,
  };
}
