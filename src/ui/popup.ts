import ContextualIdentity = browser.contextualIdentities.ContextualIdentity;

const CONTAINER_LIST_ID = "container-list";

function buildNewContextualIdentitiesList(
  contextualIdentities: ContextualIdentity[],
): HTMLDivElement {
  const div = document.createElement("div");
  div.id = CONTAINER_LIST_ID;
  div.className = "panel-section panel-section-list";
  for (const contextualIdentity of contextualIdentities) {
    const item = buildListItem(contextualIdentity);
    div.appendChild(item);
  }
  console.log(div);
  return div;
}

function buildListItem(contextualIdentity: ContextualIdentity): HTMLDivElement {
  console.log(JSON.stringify(contextualIdentity));
  const panelListItem = document.createElement("div");
  panelListItem.className = "panel-list-item";
  const iconDiv = document.createElement("div");
  iconDiv.className = "icon";
  iconDiv.style.paddingRight = "1rem";
  iconDiv.style.paddingLeft = ".5rem";

  const iconImg = document.createElement("img");
  iconImg.src = contextualIdentity.iconUrl;
  const filter = toColorfilter(contextualIdentity.color);
  if (filter) {
    console.log("adding filter " + filter);
    iconDiv.style.filter = filter;
  }
  iconImg.style.width = "1rem";
  iconImg.style.height = "1rem";
  iconDiv.appendChild(iconImg);
  panelListItem.appendChild(iconDiv);
  const textDiv = document.createElement("div");
  textDiv.className = "text";
  const text = document.createTextNode(contextualIdentity.name);
  // const text = document.createElement("textarea");
  // text.textContent = contextualIdentity.name;
  textDiv.appendChild(text);

  panelListItem.appendChild(textDiv);
  return panelListItem;
}

function toColorfilter(color: string): string | null {
  // Each of this is a filter generated with this tool:https://isotropic.co/tool/hex-color-to-css-filter/
  // The comment shows the original color code used to generate the filter
  switch (color) {
    case "blue": //#37adff
      return "invert(51%) sepia(79%) saturate(849%) hue-rotate(180deg) brightness(102%) contrast(100%)";
    case "turquoise": //#00c79a
      return "invert(71%) sepia(65%) saturate(5024%) hue-rotate(128deg) brightness(98%) contrast(101%)";
    case "green": // #51cd00
      return "invert(72%) sepia(58%) saturate(4017%) hue-rotate(54deg) brightness(98%) contrast(104%)";
    case "yellow": //#ffcb00
      return "invert(84%) sepia(34%) saturate(2983%) hue-rotate(358deg) brightness(99%) contrast(105%)";
    case "orange": //#ff9f00
      return "invert(59%) sepia(11%) saturate(5702%) hue-rotate(3deg) brightness(110%) contrast(102%)";
    case "red": //#ff613d
      return "invert(58%) sepia(95%) saturate(4005%) hue-rotate(337deg) brightness(107%) contrast(101%)";
    case "pink": //#ff4bda
      return "invert(46%) sepia(68%) saturate(3300%) hue-rotate(289deg) brightness(105%) contrast(101%)";
    case "purple": //#af51f5
      return "invert(58%) sepia(62%) saturate(7296%) hue-rotate(252deg) brightness(100%) contrast(93%)";
    case "toolbar":
      return null;
    default:
      console.error(
        "We tried to build a filter for an unknown color string: " + color,
      );
      return null;
  }
}

console.log("starting popup");
browser.contextualIdentities.query({}).then((contextualIdentities) => {
  const newDiv = buildNewContextualIdentitiesList(contextualIdentities);

  const div = document.querySelector("#" + CONTAINER_LIST_ID);
  if (div) {
    div.replaceWith(newDiv);
    console.log(document.body);
  } else {
    console.log("Failed to find div");
  }
});
