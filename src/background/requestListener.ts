import _OnBeforeRequestDetails = browser.webRequest._OnBeforeRequestDetails;
import { ContainerRouter } from "./containerRouter";
import BlockingResponse = browser.webRequest.BlockingResponse;

async function onBeforeRequest(
  containerRouter: ContainerRouter,
  details: _OnBeforeRequestDetails,
): Promise<BlockingResponse> {
  console.debug("Before a request for " + JSON.stringify(details));
  browser.tabs.get(details.tabId).then((tab) => {
    console.debug("The tab information is " + JSON.stringify(tab));
  });

  const entry = containerRouter.lookUpHostname(new URL(details.url));
  console.debug("In the request we got " + JSON.stringify(entry));
  if (details.cookieStoreId != entry) {
    await browser.tabs.create({
      url: details.url,
      index: details.tabId + 1,
      cookieStoreId: entry,
    });
    return {
      cancel: true,
    };
  } else {
    return {
      cancel: false,
    };
  }
}

// Set up the handler that will listen to and inspect all incoming requests
export function setupRequestListener(containerRouter: ContainerRouter): void {
  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      return onBeforeRequest(containerRouter, details);
    },
    {
      urls: ["<all_urls>"],
      types: ["main_frame"],
    },
    ["blocking"],
  );
}
