import { containerDefinitionToContextualIdentity, Policy } from "./policy";
import { buildContainerDifference } from "./containers";
import { ContainerRouter } from "./containerRouter";
import ContextualIdentity = browser.contextualIdentities.ContextualIdentity;

// Once we get a policy, lets attempt to parse it.  If it parses correctly update the containerRouter
function parseAndApplyPolicy(router: ContainerRouter, blob: unknown) {
  const parsedPolicy = Policy.parse(blob);
  browser.contextualIdentities.query({}).then(async (contextualIdentities) => {
    const results = buildContainerDifference(
      parsedPolicy,
      contextualIdentities,
    );
    console.debug(
      "We evaluated our current state of containers and got back " +
        JSON.stringify(results),
    );
    for (const cookieStoreId of results.toRemove) {
      console.debug("Removing container with cookieStoreId " + cookieStoreId);
      await browser.contextualIdentities.remove(cookieStoreId);
    }
    for (const changedEntry of results.toUpdate) {
      console.debug(
        "Updating container with cookieStoreId " +
          changedEntry.cookieStoreId +
          "to be " +
          JSON.stringify(changedEntry),
      );
      const contextualIdentity = await browser.contextualIdentities.update(
        changedEntry.cookieStoreId,
        containerDefinitionToContextualIdentity(changedEntry.newValue),
      );
      console.debug("Updated " + JSON.stringify(contextualIdentity));
    }
    // results.toAdd
    for (const newEntry of results.toAdd) {
      console.debug(
        "Creating new container with details " + JSON.stringify(newEntry),
      );
      const contextualIdentity = await browser.contextualIdentities.create(
        containerDefinitionToContextualIdentity(newEntry),
      );
      console.debug("Created " + JSON.stringify(contextualIdentity));
      router.addEntry(newEntry, contextualIdentity);
    }

    if (parsedPolicy.containers) {
      console.debug("Clearing and setting router up");
      router.clear();
      // After we went through and created, updated and deleted everything, lets requery.  Then we will use these
      // cookie store IDs to populate our containerRouter
      const lookup = await browser.contextualIdentities
        .query({})
        .then((result) => {
          return result.reduce((acc, value) => {
            acc.set(value.name, value);
            return acc;
          }, new Map<string, ContextualIdentity>());
        });
      for (const definition of parsedPolicy.containers) {
        const contextualIdentity = lookup.get(definition.name);
        if (contextualIdentity) {
          router.addEntry(definition, contextualIdentity);
        } else {
          console.error("Failed to find contextualIdentity we just set up");
        }
      }
    }
  });
}

// Reads out the current state of the managed policy and sets up a listener to capture any future updates
export function setupPolicyListener(router: ContainerRouter) {
  browser.storage.managed.onChanged.addListener((change) => {
    console.debug(
      "We have received a configuration update " + JSON.stringify(change),
    );
    parseAndApplyPolicy(router, change.newValue);
  });

  console.debug("About to read from the managed manifest");
  browser.storage.managed
    .get(null) // Fetch the full policy
    .then((configurationBlob) => {
      console.debug(
        "Read out configuration " + JSON.stringify(configurationBlob),
      );
      parseAndApplyPolicy(router, configurationBlob);
    });
}
