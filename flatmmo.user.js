// ==UserScript==
// @name         NowItsIdle
// @namespace    http://tampermonkey.net/
// @version      2025-11-15
// @description  try to take over the world!
// @author       You
// @match        *://flatmmo.com/play.php
// @grant        none
// @require      common.js
// @require      mapObjects.js
// @require      npc.js
// @require      notifications.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

(function () {
  "use strict";
  
  const updatePanels = () => {
    if (currentMapName !== current_map) {
      currentMapName = current_map;
      updateMapObjectsPanel(true);
      updateNpcPanel(true);
      return;
    }
    updateMapObjectsPanel(false);
    updateNpcPanel(false);
  };

  const windowCheckInterval = setInterval(() => {
    if (window.paint_effects) {
      clearInterval(windowCheckInterval);
      const originalPaint = window.paint_effects;
      window.paint_effects = function () {
        originalPaint();
        tilesToHighlight.forEach(({ x, y }) => {
          highlightTiles(x, y);
        });
      };
    }
  }, 100);

  doLoop(100, 100, updateStates);
  doLoop(500, 500, updatePanels)
  doLoop(332, 692, pickupLoop);
  doLoop(453, 3235, mapObjectLoop);
  doLoop(530, 1284, npcLoop);
  doLoop(1000, 1000, notificationLoop);
  makeDraggable(mapObjectPanel);
  makeDraggable(npcPanel);
})();
