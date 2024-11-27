import { z } from "zod";
import { ContainerDefinition } from "./policy";
import ContextualIdentity = browser.contextualIdentities.ContextualIdentity;

// At helper class to translate between hostnames and cookie store IDs
export class ContainerRouter {
  lookup: Map<string, string>;
  excludedContainerNames: string[];
  excludedCookieStoreIds: string[];

  constructor() {
    this.lookup = new Map();
    this.excludedContainerNames = [];
    this.excludedCookieStoreIds = [];
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
      this.lookup.set(site, contextualIdentity.cookieStoreId);
    }
  }

  setExcludedContainerNames(name: string[]) {
    this.excludedContainerNames = name;
  }

  checkIfExcluded(contextualIdentity: ContextualIdentity) {
    if (this.excludedContainerNames.includes(contextualIdentity.name)) {
      this.excludedCookieStoreIds.push(contextualIdentity.cookieStoreId);
    }
  }
  clear() {
    this.lookup.clear();
    this.excludedContainerNames = [];
    this.excludedCookieStoreIds = [];
  }

  lookUpHostname(hostname: URL, cookieStoreId: string | undefined): string {
    console.debug("Looking up " + hostname.hostname);
    console.debug("Contents is " + JSON.stringify(this.lookup));
    console.debug("Excluded " + JSON.stringify(this.excludedCookieStoreIds));
    if (cookieStoreId && this.excludedCookieStoreIds.includes(cookieStoreId)) {
      return cookieStoreId;
    }
    const split = hostname.hostname.split(".");

    if (split.length >= 2) {
      const last = split.pop();
      const base = split.pop();
      const result = this.lookup.get(base + "." + last);
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
