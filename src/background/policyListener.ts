import { containerDefinitionToContextualIdentity, Policy } from "./policy";
import { buildContainerDifference } from "./containers";
import { ContainerRouter } from "./containerRouter";
import ContextualIdentity = browser.contextualIdentities.ContextualIdentity;

// Once we get a policy, lets attempt to parse it.  If it parses correctly update the containerRouter
function parseAndApplyPolicy(
  router: ContainerRouter,
  blob: { [p: string]: unknown },
) {
  browser.contextualIdentities.query({}).then(async (contextualIdentities) => {
    const parsedPolicy = Policy.parse(blob);
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
      // Now let's process all the excluded container names if we have any.
      if (parsedPolicy.exclude) {
        // Let's pass the list to the router first.  We do this so it can check on containers created later to see if
        // they should be excluded
        router.setExcludedContainerNames(parsedPolicy.exclude);
        // This repeats some of the logic in the checkIfExcluded.  We *could* just pass in everything in lookup and have
        // that sort it out, but do this to save some wasted processing.
        for (const excluded of parsedPolicy.exclude) {
          const value = lookup.get(excluded);
          if (value) {
            router.checkIfExcluded(value);
          }
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
    parseAndApplyPolicy(router, change);
  });

  browser.contextualIdentities.onCreated.addListener((change) => {
    console.debug(
      "One or more new contextual identities have been created " +
        JSON.stringify(change),
    );
    router.checkIfExcluded(change.contextualIdentity);
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
