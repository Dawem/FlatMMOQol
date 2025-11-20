const inactiveAnimation = "stand";
let currentMapName = current_map;
let tilesToHighlight = [];
let isIdle;
let sleepValue;

const addPanelStyle = (element) => {
  element.style.position = "fixed";
  element.style.top = "20px";
  element.style.left = "20px";
  element.style.overflowY = "auto";
  element.style.background = "rgba(50,50,50,0.85)";
  element.style.color = "white";
  element.style.padding = "10px";
  element.style.fontFamily = "Arial,sans-serif";
  element.style.fontSize = "13px";
  element.style.borderRadius = "8px";
  element.style.zIndex = "999999";
  element.style.userSelect = "none";
  element.style.boxShadow = "0 0 15px rgba(0,0,0,0.7)";
  element.style.pointerEvents = "auto";
  element.style.display = "block";
};

const createPanel = () => {
  const panel = document.createElement("div");
  addPanelStyle(panel);
  document.body.appendChild(panel);
  return panel;
};

const highlightTiles = (x, y) => {
  ctx.globalAlpha = 0.2;
  let color = "black";
  ctx.fillStyle = color;
  ctx.beginPath();
  let hover_tile = get_postition_from_tile(x, y);
  ctx.rect(hover_tile.x, hover_tile.y, TILE_SIZE, TILE_SIZE);
  ctx.fill();
  ctx.globalAlpha = 1.0;
};

const minimizeTable = (button, panel, isMinimized) => {
  const isMin = !isMinimized;
  const elementsToToggle = panel.querySelectorAll(".settingsMinimize");
  elementsToToggle.forEach((el) => {
    el.style.display = isMin ? "none" : "table-cell";
  });
  button.textContent = isMin ? ">" : "<";
  return isMin;
};

const highlightOnRowHover = (uuid, data) => {
  const thingToHighlight = data.find((obj) => obj.uuid === uuid);
  if (!thingToHighlight) return;
  const { x, y } = thingToHighlight;
  tilesToHighlight.push({ x, y });
};

const toggleObjectEnabled = (element, data) => {
  const objectToEnable = data.find((o) => o.uuid === element.id);
  if (objectToEnable) {
    objectToEnable.enabled = !objectToEnable.enabled;
  }
};

const makeDraggable = (el, handleSelector = null) => {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const handle = handleSelector ? el.querySelector(handleSelector) : el;
  if (!handle) return;

  handle.style.cursor = "move";
  const dragMouseDown = (e) => {
    isDragging = true;
    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;
    document.body.style.userSelect = "none";
  };

  handle.addEventListener("mousedown", dragMouseDown);

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    el.style.left = e.clientX - offsetX + "px";
    el.style.top = e.clientY - offsetY + "px";
    el.style.right = "auto";
    el.style.bottom = "auto";
    el.style.position = "fixed";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "";
  });
};

getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const doLoop = (minWait, maxWait, loop) => {
  if (Globals.websocket.readyState !== 1) {
    setTimeout(() => doLoop(minWait, maxWait, loop), 1000);
    return;
  }
  loop();
  const rand = getRandomInt(minWait, maxWait);
  setTimeout(() => doLoop(minWait, maxWait, loop), rand);
};

const updateStates = () => {
  isIdle = active_animations[Globals.local_username]?.animation_name === inactiveAnimation;
  sleepValue = document.querySelector("[data-id=sleep-value]").innerText;
};
