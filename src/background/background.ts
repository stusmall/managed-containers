import _OnBeforeRequestDetails = browser.webRequest._OnBeforeRequestDetails;

function onBeforeRequest(details: _OnBeforeRequestDetails) {
console.log(details)
}

browser.webRequest.onBeforeRequest.addListener(onBeforeRequest, {
    urls: ["<all_urls>"],
    types: ["main_frame"]},
    ["blocking"]
);
