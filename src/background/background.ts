import _OnBeforeRequestDetails = browser.webRequest._OnBeforeRequestDetails;

function onBeforeRequest(details: _OnBeforeRequestDetails) {
  console.log(details);
  browser.contextualIdentities.query({}).then((stuff) => {
    console.log(
      "looking at the browser contextual identities " + JSON.stringify(stuff),
    );
  });
}

browser.contextualIdentities
  .create({
    name: "thisisonefromthetest",
    color: "purple",
    icon: "tree",
  })
  .then((x) => {
    console.log("created container" + JSON.stringify(x));
  });

browser.webRequest.onBeforeRequest.addListener(
  onBeforeRequest,
  {
    urls: ["<all_urls>"],
    types: ["main_frame"],
  },
  ["blocking"],
);
