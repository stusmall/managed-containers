import { z } from "zod";
import { ContainerDefinition } from "./policy";
import ContextualIdentity = browser.contextualIdentities.ContextualIdentity;

// At helper class to translate between hostnames and cookie store IDs
export class ContainerRouter {
  lookup: { [hostname: string]: string };

  constructor() {
    this.lookup = {};
  }

  addEntry(
    definition: z.infer<typeof ContainerDefinition>,
    contextualIdentity: ContextualIdentity,
  ) {
    console.debug(
      "Adding entries for container with cookieStoreId " +
        contextualIdentity.cookieStoreId,
    );
    for (const site of definition.sites) {
      console.debug(
        "Site " +
          site +
          " will be handled by " +
          contextualIdentity.cookieStoreId,
      );
      this.lookup[site] = contextualIdentity.cookieStoreId;
    }
  }

  lookUpHostname(hostname: URL): string {
    console.debug("Looking up " + hostname.hostname);
    return this.lookup[hostname.hostname];
  }
}
