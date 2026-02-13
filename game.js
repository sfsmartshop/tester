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
      "Fog hangs over silent cobblestones. The old clocktower looms ahead, and a dark workshop sits to the east.",
    actions: [
      { label: "Go to workshop", type: "move", target: "workshop" },
      { label: "Approach clocktower door", type: "move", target: "clocktower" },
      { label: "Inspect broken fountain", type: "inspectFountain" },
    ],
  },
  workshop: {
    name: "Abandoned Workshop",
    description:
      "Dusty benches line the walls. A rusty crowbar and a compact battery rest on a table.",
    actions: [
      { label: "Return to square", type: "move", target: "square" },
      { label: "Take crowbar", type: "takeCrowbar" },
      { label: "Take battery", type: "takeBattery" },
    ],
  },
  clocktower: {
    name: "Clocktower Entrance",
    description:
      "An access panel beside the door is sealed shut. A locked chest sits under the stairs.",
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
      log("You find nothing useful in the fountain but a few old coins.");
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
        log("With a loud screech, you pry open the panel.");
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
        log("The tower lights flicker on. You hear a chest lock click nearby.");
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
          "The key turns. The clocktower door swings open, and the town bells ring again. You win!",
          "victory"
        );
      }
      break;
    default:
      log("Nothing happens.");
  }

  render();
}

function render() {
  const room = rooms[state.room];
  locationNameEl.textContent = room.name;

  sceneEl.innerHTML = "";
  const description = document.createElement("p");
  description.className = "room-description";
  description.textContent = room.description;
  sceneEl.appendChild(description);

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

log("You arrive at the deserted square. Find a way into the clocktower.");
render();
