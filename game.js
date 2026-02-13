const state = {
  room: "square",
  inventory: [],
  flags: {
    crowbarTaken: false,
    batteryTaken: false,
    panelOpened: false,
    powerOn: false,
    chestOpen: false,
    keyTaken: false,
    gameWon: false,
  },
};

const rooms = {
  square: {
    name: "Town Square",
    description:
      "The moonlight hits the cobblestones. Click hotspots like an old LucasArts scene.",
    sceneClass: "scene-square",
    objects: ["clocktower", "fountain"],
    hotspots: [
      {
        label: "Workshop",
        type: "move",
        target: "workshop",
        style: "left: 8%; top: 48%; width: 20%; height: 18%;",
      },
      {
        label: "Clocktower",
        type: "move",
        target: "clocktower",
        style: "left: 56%; top: 16%; width: 18%; height: 54%;",
      },
      {
        label: "Fountain",
        type: "inspectFountain",
        style: "left: 10%; top: 64%; width: 20%; height: 18%;",
      },
    ],
    actions: [
      { label: "Go to workshop", type: "move", target: "workshop" },
      { label: "Approach clocktower door", type: "move", target: "clocktower" },
      { label: "Inspect broken fountain", type: "inspectFountain" },
    ],
  },
  workshop: {
    name: "Abandoned Workshop",
    description: "Dusty tools and a bench. Useful items still remain.",
    sceneClass: "scene-workshop",
    objects: ["workbench", "crowbar", "battery"],
    hotspots: [
      {
        label: "Square",
        type: "move",
        target: "square",
        style: "left: 2%; top: 42%; width: 18%; height: 36%;",
      },
      {
        label: "Crowbar",
        type: "takeCrowbar",
        style: "left: 40%; top: 54%; width: 13%; height: 11%;",
      },
      {
        label: "Battery",
        type: "takeBattery",
        style: "left: 56%; top: 51%; width: 12%; height: 16%;",
      },
    ],
    actions: [
      { label: "Return to square", type: "move", target: "square" },
      { label: "Take crowbar", type: "takeCrowbar" },
      { label: "Take battery", type: "takeBattery" },
    ],
  },
  clocktower: {
    name: "Clocktower Entrance",
    description: "A sealed panel, a stubborn chest, and a locked door.",
    sceneClass: "scene-clocktower",
    objects: ["clocktower", "panel", "chest", "key"],
    hotspots: [
      {
        label: "Square",
        type: "move",
        target: "square",
        style: "left: 2%; top: 42%; width: 17%; height: 35%;",
      },
      {
        label: "Panel",
        type: "openPanel",
        style: "left: 23%; top: 48%; width: 10%; height: 20%;",
      },
      {
        label: "Battery Slot",
        type: "insertBattery",
        style: "left: 35%; top: 49%; width: 16%; height: 19%;",
      },
      {
        label: "Chest",
        type: "openChest",
        style: "left: 60%; top: 66%; width: 18%; height: 17%;",
      },
      {
        label: "Take Key",
        type: "takeKey",
        style: "left: 65%; top: 62%; width: 13%; height: 12%;",
      },
      {
        label: "Use Key",
        type: "useKey",
        style: "left: 56%; top: 18%; width: 18%; height: 46%;",
      },
    ],
    actions: [
      { label: "Return to square", type: "move", target: "square" },
      { label: "Pry open access panel", type: "openPanel" },
      { label: "Insert battery", type: "insertBattery" },
      { label: "Open chest", type: "openChest" },
      { label: "Take clocktower key", type: "takeKey" },
      { label: "Use key on tower door", type: "useKey" },
    ],
  },
};

const sceneEl = document.getElementById("scene");
const logEl = document.getElementById("log");
const inventoryEl = document.getElementById("inventory");
const locationNameEl = document.getElementById("locationName");

function hasItem(item) {
  return state.inventory.includes(item);
}

function addItem(item) {
  if (!hasItem(item)) {
    state.inventory.push(item);
  }
}

function log(message, kind = "normal") {
  const p = document.createElement("p");
  p.className = `log-entry ${kind}`;
  p.textContent = message;
  logEl.prepend(p);
}

function renderInventory() {
  inventoryEl.innerHTML = "";
  if (!state.inventory.length) {
    inventoryEl.textContent = "(empty)";
    return;
  }

  state.inventory.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "item";
    chip.textContent = item;
    inventoryEl.appendChild(chip);
  });
}

function executeAction(type, target) {
  switch (type) {
    case "move":
      state.room = target;
      break;
    case "inspectFountain":
      log("You find a few old coins, but no clues.");
      break;
    case "takeCrowbar":
      if (state.flags.crowbarTaken) {
        log("You already picked up the crowbar.");
      } else {
        state.flags.crowbarTaken = true;
        addItem("crowbar");
        log("You take the crowbar.");
      }
      break;
    case "takeBattery":
      if (state.flags.batteryTaken) {
        log("You already took the battery.");
      } else {
        state.flags.batteryTaken = true;
        addItem("battery");
        log("You pocket the battery.");
      }
      break;
    case "openPanel":
      if (state.flags.panelOpened) {
        log("The panel is already open.");
      } else if (!hasItem("crowbar")) {
        log("You need something to pry the panel open.");
      } else {
        state.flags.panelOpened = true;
        log("With a loud screech, the panel pops open.");
      }
      break;
    case "insertBattery":
      if (!state.flags.panelOpened) {
        log("You need to open the panel first.");
      } else if (!hasItem("battery")) {
        log("You don't have a battery.");
      } else if (state.flags.powerOn) {
        log("Power is already restored.");
      } else {
        state.flags.powerOn = true;
        log("The tower lights flicker on. A lock clicks nearby.");
      }
      break;
    case "openChest":
      if (!state.flags.powerOn) {
        log("The chest remains locked tight.");
      } else if (state.flags.chestOpen) {
        log("The chest is already open.");
      } else {
        state.flags.chestOpen = true;
        log("The chest opens, revealing a brass key.");
      }
      break;
    case "takeKey":
      if (!state.flags.chestOpen) {
        log("You don't see a key yet.");
      } else if (state.flags.keyTaken) {
        log("You already took the key.");
      } else {
        state.flags.keyTaken = true;
        addItem("clocktower key");
        log("You take the clocktower key.");
      }
      break;
    case "useKey":
      if (!hasItem("clocktower key")) {
        log("The door is locked. You need a key.");
      } else if (state.flags.gameWon) {
        log("The door is already open.");
      } else {
        state.flags.gameWon = true;
        log(
          "The key turns. The clocktower door opens, and the bells ring again. You win!",
          "victory"
        );
      }
      break;
    default:
      log("Nothing happens.");
  }

  render();
}

function renderScene(room) {
  const pixelScene = document.createElement("div");
  pixelScene.className = `pixel-scene ${room.sceneClass}`;

  room.objects.forEach((obj) => {
    if (obj === "crowbar" && state.flags.crowbarTaken) return;
    if (obj === "battery" && state.flags.batteryTaken) return;
    if (obj === "key" && (!state.flags.chestOpen || state.flags.keyTaken)) return;

    const piece = document.createElement("div");
    piece.className = `pixel-object obj-${obj}`;
    pixelScene.appendChild(piece);
  });

  room.hotspots.forEach((hotspotDef) => {
    const hotspot = document.createElement("button");
    hotspot.type = "button";
    hotspot.className = "hotspot";
    hotspot.textContent = hotspotDef.label;
    hotspot.setAttribute("style", hotspotDef.style);
    hotspot.addEventListener("click", () => executeAction(hotspotDef.type, hotspotDef.target));
    pixelScene.appendChild(hotspot);
  });

  return pixelScene;
}

function render() {
  const room = rooms[state.room];
  locationNameEl.textContent = room.name;
  sceneEl.innerHTML = "";

  const description = document.createElement("p");
  description.className = "room-description";
  description.textContent = room.description;
  sceneEl.appendChild(description);

  sceneEl.appendChild(renderScene(room));

  const actions = document.createElement("div");
  actions.className = "actions";

  room.actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label;
    button.addEventListener("click", () => executeAction(action.type, action.target));
    actions.appendChild(button);
  });

  sceneEl.appendChild(actions);
  renderInventory();
}

log("You arrive at the square. Point and click your way into the clocktower.");
render();

