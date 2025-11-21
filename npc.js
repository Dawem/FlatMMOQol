let isNpcsMinimized = true;
let isNpcEnabled = false;
let isAutoPickupEnabled = true;
let isAutoEatEnabled = true;

let npcData = [];
let fightingNpc = null;
let pickupRange = localStorage.getItem("pickupRange") ?? 3;
let healAmount = localStorage.getItem("healAmount") ?? 10;

const npcPanel = createPanel();
npcPanel.style.top = "50%";

const toggleMinimizeNpcTable = (button) => {
  isNpcsMinimized = minimizeTable(button, npcPanel, isNpcsMinimized);
};

const initNpcPanel = () => {
  let html = /*html*/ ` 
    <div style="max-height:400px;overflow-y:auto;width:100%;">
      <table style="width:100%; border-collapse: collapse;margin-bottom:8px;border:1px solid #444;">`;
  html += /*html*/ ` 
        <thead>
          <tr>
            <th style="padding:2px 6px;">Name</th>
            <th style="padding:2px 6px;display:none;" class="settingsMinimize">UUID</th>
            <th style="padding:2px 6px;display:none;" class="settingsMinimize">In Combat</th>
            <th style="padding:2px 6px;">Enable</th>
          </tr>
        </thead>
        <tbody>`;
  npcData.forEach((obj) => {
    if (!obj) return;
    html += /*html*/ ` 
            <tr id="${obj.uuid}_row" data-x="${obj.x}" data-y="${obj.y}" style="cursor:pointer;">
              <td style="padding:2px 6px; border-top:1px solid #444;">${obj.name}</td>
              <td style="padding:2px 6px; border-top:1px solid #444; display:none;" class="settingsMinimize">${obj.uuid}</td>
              <td style="padding:2px 6px; border-top:1px solid #444; display:none;" id="${obj.uuid}_state_cell" class="settingsMinimize">${obj.inCombat}</td>
              <td style="padding:2px 6px; border-top:1px solid #444;" id="${obj.uuid}_checkbox_cell" >
              </td>
            </tr>`;
  });
  html += /*html*/ `
        </tbody>
      </table>
    </div>`;
  npcPanel.innerHTML = /*html*/ `
    <div style="font-size:16px;font-weight:bold;">
      <span style="margin-top:0;margin-bottom:8px;">
        NPCs
      </span>
      <span style="cursor:pointer;font-size:24px;float:right;" id="minimizeButton">${isNpcsMinimized ? ">" : "<"}</span>
    </div>
    ${html}
    <label for="autoPickupCheckbox">Auto Pickup Items&nbsp;</label>
    <input type="checkbox" id="autoPickupCheckbox" name="autoPickupCheckbox" checked />
    <br/>
    <label for="pickupRange" style="font-size:12px;font-weight:bold;">Pickup Range&nbsp;</label>
    <input type="number" id="pickupRange" name="pickupRange" value="${pickupRange}" min="1" max="20" style="width:50px;margin-top:8px;margin-bottom:8px;padding:4px;" />
    <br/>
    <label for="itemIgnoreList" style="font-size:12px;font-weight:bold;"> Item Ignore List (comma separated)</label><br/>
    <textarea id="itemIgnoreList" name="itemIgnoreList" rows="5" style="width:95%; margin-top:8px;margin-bottom:8px;padding:4px;"></textarea>
    <br/>
    <label for="autoEatCheckbox"> Auto Eat</label>
    <input type="checkbox" id="autoEatCheckbox" name="autoEatCheckbox" checked />
    <br/>
    <label for="healAmount" style="font-size:12px;font-weight:bold;">Heal Amount&nbsp;</label>
    <input type="number" id="healAmount" name="healAmount" value="${healAmount}" min="1" max="100" style="width:50px;margin-top:8px;margin-bottom:8px;padding:4px;" />
    <br/>
    `;

  npcData.forEach((obj) => {
    const checkboxCell = npcPanel.querySelector(`#${obj.uuid}_checkbox_cell`);
    if (checkboxCell) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = obj.uuid;
      checkbox.name = obj.name;
      checkbox.checked = obj.enabled;
      checkbox.addEventListener("change", () => toggleObjectEnabled(checkbox, npcData));
      checkboxCell.appendChild(checkbox);
    }
    const objectRow = npcPanel.querySelector(`#${obj.uuid}_row`);
    objectRow.addEventListener("mouseover", () => highlightOnRowHover(obj.uuid, npcData));
    objectRow.addEventListener("mouseout", () => {
      tilesToHighlight = [];
    });
  });

  const autoPickupCheckbox = npcPanel.querySelector("#autoPickupCheckbox");
  autoPickupCheckbox.checked = isAutoPickupEnabled;
  autoPickupCheckbox.addEventListener("click", () => {
    isAutoPickupEnabled = autoPickupCheckbox.checked;
  });

  const pickupRangeInput = npcPanel.querySelector("#pickupRange");
  pickupRangeInput.addEventListener("change", () => {
    pickupRange = parseInt(pickupRangeInput.value);
    localStorage.setItem("pickupRange", pickupRange);
  });

  const autoEatCheckbox = npcPanel.querySelector("#autoEatCheckbox");
  autoEatCheckbox.checked = isAutoEatEnabled;
  autoEatCheckbox.addEventListener("click", () => {
    isAutoEatEnabled = autoEatCheckbox.checked;
    
  });

  const healAmountInput = npcPanel.querySelector("#healAmount");
  healAmountInput.addEventListener("change", () => {
    healAmount = parseInt(healAmountInput.value);
    localStorage.setItem("healAmount", healAmount);
  });

  const itemIgnoreListInput = npcPanel.querySelector("#itemIgnoreList");
  itemIgnoreListInput.value = localStorage.getItem("itemIgnoreList") ?? "";
  itemIgnoreListInput.addEventListener("change", () => {
    localStorage.setItem("itemIgnoreList", itemIgnoreListInput.value);
  });

  const minimizeNpcButton = npcPanel.querySelector("#minimizeButton");
  minimizeNpcButton.addEventListener("click", () => toggleMinimizeNpcTable(minimizeNpcButton));

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
    isNpcEnabled = !isNpcEnabled;
    enableButton.textContent = isNpcEnabled ? "Disable" : "Enable";
    enableButton.style.backgroundColor = isNpcEnabled ? "#dc3545" : "#28a745";
  });
  npcPanel.appendChild(enableButton);
};

const updateNpcData = () => {
  npcData = Object.keys(npcs).map((key) => {
    const npc = npcs[key];
    const existingNpc = npcData.find((existingNpc) => existingNpc.uuid === npc.uuid);

    if (existingNpc) {
      return {
        ...existingNpc,
        inCombat: npc.in_combat,
        x: npc.x,
        y: npc.y,
        isHidden: npc.is_hidden,
      };
    }
    return {
      name: npc.name,
      uuid: npc.uuid,
      inCombat: npc.in_combat,
      x: npc.x,
      y: npc.y,
      enabled: false,
      isHidden: npc.is_hidden,
    };
  });

  if (npcPanel.innerHTML === "" || npcPanel.querySelector("tbody").innerText === "") initNpcPanel();
};

const pickupLoop = () => {
  if (!isAutoPickupEnabled) {
    return;
  }
  const playerX = parseInt(players[Globals.local_username].client_x / TILE_SIZE);
  const playerY = parseInt(players[Globals.local_username].client_y / TILE_SIZE);
  itemsToPickup = [...ground_items].filter(
    (item) => Math.max(Math.abs(item.x - playerX), Math.abs(item.y - playerY)) <= pickupRange
  );

  const itemIgnoreListInput = document.getElementById("itemIgnoreList");
  const itemIgnoreList = itemIgnoreListInput
    ? itemIgnoreListInput.value.split(",").map((item) => item.trim().toLowerCase())
    : [];

  for (let i = 0; i < itemsToPickup.length; i++) {
    const ground_item = itemsToPickup[i];
    if (ground_item && !itemIgnoreList.includes(ground_item.name.toLowerCase())) {
      Globals.websocket.send("CLICKED_GROUND_ITEM=" + ground_item.uuid);
      itemsToPickup.splice(i, 1);
    }
  }
};

const npcLoop = () => {
  if (!isNpcEnabled || sleepValue === "0") {
    return;
  }
  const playerInCombat = players[Globals.local_username].in_combat_ticker > 0; // see if there's a websocket to use to exit combat
  const actionableObjects = npcData.filter((obj) => obj.enabled && !obj.inCombat && !obj.isHidden);
  const closestNpc = actionableObjects.reduce((closest, npc) => {
    const playerX = parseInt(players[Globals.local_username].client_x / TILE_SIZE);
    const playerY = parseInt(players[Globals.local_username].client_y / TILE_SIZE);
    const npcX = npc.x;
    const npcY = npc.y;
    const distance = Math.hypot(npcX - playerX, npcY - playerY);
    if (closest === null || distance < closest.distance) {
      return { npc, distance };
    }
    return closest;
  }, null);

  if (closestNpc && isIdle && (!playerInCombat || fightingNpc === null)) {
    fightingNpc = closestNpc.npc;
    Globals.websocket.send(`CLICKS_NPC=${fightingNpc.uuid}`);
  }

  if (fightingNpc && npcData.find((n) => n.uuid === fightingNpc.uuid)?.isHidden) {
    fightingNpc = null;
  }
};

const eatLoop = () => {
  if (!isAutoEatEnabled) {
    return;
  }
  const playerHp = players[Globals.local_username].hp;
  const playerMaxHp = players[Globals.local_username].max_hp;
  const missingHpAmount = playerMaxHp - playerHp;
  if (missingHpAmount > healAmount) {
    Globals.websocket.send("SHORTCUT_KEY=F2");
  }
};

const updateNpcPanel = (mapChanged) => {
  if (mapChanged) {
    isNpcEnabled = false;
    (npcPanel?.querySelector("tbody") ?? {}).innerText = "";
    npcData = [];
  }
  updateNpcData();
  npcData.forEach((obj) => {
    const stateCell = npcPanel.querySelector(`#${obj.uuid}_state_cell`);
    if (stateCell) {
      stateCell.textContent = obj.inCombat;
    }
  });
};
