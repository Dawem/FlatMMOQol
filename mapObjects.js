let isMapObjectsMinimized = true;
let isMapObjectsEnabled = false;

let mapObjectData = [];

const inactiveObjects = ["empty_rock", "tree_stump"];

const mapObjectPanel = createPanel();

const toggleMinimizeMapObjectsTable = (button) => {
  isMapObjectsMinimized = minimizeTable(button, mapObjectPanel, isMapObjectsMinimized);
};

const initMapObjectPanel = () => {
  let html = /*html*/ `
    <div style="max-height:500px;overflow-y:auto;width:100%;">
      <table style="width:100%; border-collapse: collapse;">`;
  html += /*html*/ ` 
        <thead>
          <tr>
            <th style="padding:2px 6px;">Name</th>
            <th style="padding:2px 6px;display:none;" class="settingsMinimize">UUID</th>
            <th style="padding:2px 6px;display:none;" class="settingsMinimize">State</th>
            <th style="padding:2px 6px;">Enable</th>
          </tr>
        </thead>
        <tbody>`;
  mapObjectData.forEach((obj) => {
    if (!obj) return;
    html += /*html*/ ` 
            <tr id="${obj.uuid}_row" data-x="${obj.x}" data-y="${obj.y}" style="cursor:pointer;">
              <td style="padding:2px 6px; border-top:1px solid #444;">${obj.name}</td>
              <td style="padding:2px 6px; border-top:1px solid #444; display:none;" class="settingsMinimize">${obj.uuid}</td>
              <td style="padding:2px 6px; border-top:1px solid #444; display:none;" id="${obj.uuid}_state_cell" class="settingsMinimize">${obj.state}</td>
              <td style="padding:2px 6px; border-top:1px solid #444;" id="${obj.uuid}_checkbox_cell" >
              </td>
            </tr>`;
  });
  html += /*html*/ `
        </tbody>
      
      </table>
    </div>`;
  mapObjectPanel.innerHTML = /*html*/ `
    <div style="font-size:16px;font-weight:bold;">
      <span style="margin-top:0;margin-bottom:8px;">
        Map Objects
      </span>
      <span style="cursor:pointer;font-size:24px;float:right;" id="minimizeButton">${
        isMapObjectsMinimized ? ">" : "<"
      }</span>
    </div>
    ${html}`;

  mapObjectData.forEach((obj) => {
    const checkboxCell = mapObjectPanel.querySelector(`#${obj.uuid}_checkbox_cell`);
    if (checkboxCell) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = obj.uuid;
      checkbox.name = obj.name;
      checkbox.checked = obj.enabled;
      checkbox.addEventListener("change", () => toggleObjectEnabled(checkbox, mapObjectData));
      checkboxCell.appendChild(checkbox);
    }

    const objectRow = mapObjectPanel.querySelector(`#${obj.uuid}_row`);
    objectRow.addEventListener("mouseover", () => highlightOnRowHover(obj.uuid, mapObjectData));
    objectRow.addEventListener("mouseout", () => {
      tilesToHighlight = [];
    });
  });

  const minimizeMapObjectButton = mapObjectPanel.querySelector("#minimizeButton");
  minimizeMapObjectButton.addEventListener("click", () => toggleMinimizeMapObjectsTable(minimizeMapObjectButton));

  const enableButton = document.createElement("button");
  enableButton.textContent = "Enable";
  enableButton.style.marginTop = "10px";
  enableButton.style.padding = "6px 12px";
  enableButton.style.backgroundColor = "#28a745";
  enableButton.style.color = "white";
  enableButton.style.border = "none";
  enableButton.style.borderRadius = "4px";
  enableButton.style.cursor = "pointer";
  enableButton.addEventListener("click", () => {
    isMapObjectsEnabled = !isMapObjectsEnabled;
    enableButton.textContent = isMapObjectsEnabled ? "Disable" : "Enable";
    enableButton.style.backgroundColor = isMapObjectsEnabled ? "#dc3545" : "#28a745";
  });
  mapObjectPanel.appendChild(enableButton);
};

const updateMapObjectData = () => {
  mapObjectData = map_objects
    .filter((obj) => obj.interactable || obj.filename.includes("tree")) //TODO: Fix trees
    .map((obj) => {
      const existinMapObject = mapObjectData.find((existingObj) => existingObj.uuid === obj.uuid);
      if (existinMapObject) {
        return {
          ...existinMapObject,
          state: obj.filename,
        };
      }
      return {
        name: obj.name,
        uuid: obj.uuid,
        state: obj.filename,
        x: obj.x,
        y: obj.y,
        enabled: false,
      };
    });
  if (mapObjectPanel.innerHTML === "" || mapObjectPanel.querySelector("tbody").innerText === "") initMapObjectPanel();
};

const mapObjectLoop = () => {
  if (!isMapObjectsEnabled || sleepValue === "0") {
    return;
  }
  const actionableObjects = mapObjectData.filter((obj) => obj.enabled);
  const readyObjects = actionableObjects.filter((mapObject) => {
    const isIncluded = inactiveObjects.some((word) => mapObject.state.includes(word));
    return !isIncluded;
  });
  if (readyObjects.length > 0 && isIdle) {
    Globals.websocket.send(`CLICKED_MAP_OBJECT=${readyObjects[0].uuid}`);
  }
};

const updateMapObjectsPanel = (mapChanged) => {
  if (mapChanged) {
    isMapObjectsEnabled = false;
    mapObjectData = [];
    (mapObjectPanel?.querySelector("tbody") ?? {}).innerText = "";
  }
  updateMapObjectData();
  mapObjectData.forEach((obj) => {
    const stateCell = document.getElementById(`${obj.uuid}_state_cell`);
    if (stateCell) {
      stateCell.textContent = obj.state;
    }
  });
};
