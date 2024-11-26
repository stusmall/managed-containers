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
  clear() {
    this.lookup = {};
  }

  lookUpHostname(hostname: URL): string {
    console.debug("Looking up " + hostname.hostname);
    console.debug("Contents is " + JSON.stringify(this.lookup));
    const split = hostname.hostname.split(".");

    if (split.length >= 2) {
      const last = split.pop();
      const base = split.pop();
      const result = this.lookup[base + "." + last];
      if (result == undefined) {
        return "firefox-default";
      } else {
        return result;
      }
    } else {
      return "firefox-default";
    }
  }
}
