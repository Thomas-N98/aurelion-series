function createInitialGameState(
  chapterId = "chapter01"
) {
  const chapter = chapters[chapterId];

  return {
    playerName: "",
    mode: "story", // "story" | "geocaching"

    chapterId,

    room: chapter.startRoom,
    area: chapter.startArea,
    visitedAreas: [chapter.startArea],

    inventory: [],
    discoveredVerbs: [],
    observations: [],

    // flags als Objekt statt Array: leichter abzufragen und zu speichern
    flags: {},

    health: "healthy", // "healthy" | "light" | "severe" | "dead"

    settings: {
      masterVolume: 0.8,
      voiceVolume: 1,
      ambienceVolume: 0.6,
      sfxVolume: 0.8,
      muted: false,
      textSize: "normal"
    }
  };
}

const chapters = {
  tutorial,
  chapter01
};

let gameState =
  createInitialGameState();

function currentChapter() {
  return chapters[gameState.chapterId];
}
function currentAliases() {
  return currentChapter().aliases || {};
}
function getUnknownCommandHint() {
  return currentChapter().unknownCommandHint || null;
}
function showUnknownCommand() {
  const hint = getUnknownCommandHint();

  if (hint) {
    showParserHint(
      "SYSTEM HINT: Befehl nicht erkannt.\n" +
      hint.replace(/^SYSTEM HINT:\s*/i, "")
    );
    return;
  }

  showParserHint(
    "SYSTEM HINT: Befehl nicht erkannt.\n" +
    "Nutze „hilfe“ oder öffne den TERMINAL unten links, um bekannte Interaktionen einzusehen."
  );
}
const commandRegistry = {
  umsehen: {
    id: "umsehen",
    label: "umsehen",
    syntax: "umsehen",
    category: "NAVIGATION",
    order: 10,
    visibleByDefault: true,
    blockedWhen: () => hasFlag("sensoryInputBlocked"),
    blockedText: "SYSTEM HINT: Umgebungsanalyse aktuell eingeschränkt.",
    description: "Beschreibt die aktuelle Umgebung erneut.",
    examples: []
  },

  gehe: {
    id: "gehe",
    label: "gehe",
    syntax: "gehe [richtung/ort]",
    category: "NAVIGATION",
    order: 20,
    visibleByDefault: true,
    blockedWhen: () => hasFlag("movementLocked") || hasFlag("legInjured"),
    blockedText: "SYSTEM HINT: Bewegung aktuell eingeschränkt.",
    description: "Bewegt dich zwischen Orten.",
    examples: [
      "gehe vorne",
      "gehe links",
      "gehe haupttor"
    ]
  },

  untersuche: {
    id: "untersuche",
    label: "untersuche",
    syntax: "untersuche [objekt]",
    category: "INTERACTION",
    order: 10,
    visibleByDefault: true,
    blockedWhen: () => hasFlag("sensoryInputBlocked") || hasFlag("focusBlocked"),
    blockedText: "SYSTEM HINT: Detaillierte Analyse aktuell nicht möglich.",
    description: "Inspiziert Gegenstände, Orte oder Hinweise genauer.",
    examples: [
      "untersuche wegweiser",
      "untersuche kartenleser"
    ]
  },

  nimm: {
    id: "nimm",
    label: "nimm",
    syntax: "nimm [objekt]",
    category: "INTERACTION",
    order: 20,
    visibleByDefault: false,
    discoveredFlag: "command_nimm_discovered",
    blockedWhen: () => hasFlag("interactionLocked") || hasFlag("handsBlocked") || hasFlag("armInjured"),
    blockedText: "SYSTEM HINT: Greifen aktuell nicht möglich.",
    description: "Hebt Gegenstände auf, wenn möglich.",
    examples: [
      "nimm zugangskarte",
      "nimm taschenlampe"
    ]
  },

  benutze: {
    id: "benutze",
    label: "benutze",
    syntax: "benutze [objekt] [ziel]",
    category: "INTERACTION",
    order: 30,
    visibleByDefault: false,
    discoveredFlag: "command_benutze_discovered",
    blockedWhen: () => hasFlag("interactionLocked") || hasFlag("handsBlocked") || hasFlag("armInjured"),
    blockedText: "SYSTEM HINT: Objektinteraktion aktuell nicht möglich.",
    description: "Verwendet einen Gegenstand auf etwas.",
    examples: [
      "benutze zugangskarte kartenleser",
      "benutze taschenlampe rohr"
    ]
  },

  oeffne: {
    id: "oeffne",
    label: "öffne",
    syntax: "öffne [objekt]",
    category: "INTERACTION",
    order: 40,
    visibleByDefault: false,
    discoveredFlag: "command_oeffne_discovered",
    blockedWhen: () => hasFlag("interactionLocked") || hasFlag("handsBlocked") || hasFlag("armInjured"),
    blockedText: "SYSTEM HINT: Öffnen aktuell nicht möglich.",
    description: "Öffnet Behälter, Türen oder Mechanismen.",
    examples: [
      "öffne auto",
      "öffne schloss"
    ]
  },

  kombiniere: {
    id: "kombiniere",
    label: "kombiniere",
    syntax: "kombiniere [objekt] [objekt]",
    category: "INTERACTION",
    order: 50,
    visibleByDefault: false,
    discoveredFlag: "command_kombiniere_discovered",
    blockedWhen: () => hasFlag("inventoryLocked") || hasFlag("handsBlocked") || hasFlag("armInjured"),
    blockedText: "SYSTEM HINT: Inventarzugriff aktuell eingeschränkt.",
    description: "Kombiniert Objekte zu etwas Neuem.",
    examples: [
      "kombiniere kabel batterie",
      "kombiniere karte leser"
    ]
  },

  hint: {
    id: "hint",
    label: "hint",
    syntax: "hint",
    category: "SYSTEM",
    order: 10,
    visibleByDefault: true,
    blockedWhen: () => hasFlag("supportProtocolLocked"),
    blockedText: "SYSTEM HINT: Support-Protokoll aktuell nicht verfügbar.",
    description: "Fordert eine begrenzte Systemanalyse der aktuellen Situation an.",
    examples: [
      "hint",
      "hint kartenleser"
    ]
  },

  terminal: {
    id: "terminal",
    label: "terminal",
    syntax: "terminal",
    category: "SYSTEM",
    order: 20,
    visibleByDefault: true,
    blockedWhen: () => hasFlag("terminalLocked"),
    blockedText: "SYSTEM HINT: Terminalzugriff aktuell gesperrt.",
    description: "Öffnet das Aurelion System Terminal.",
    examples: []
  }
};

function isCommandDiscovered(commandId) {
  const command = commandRegistry[commandId];

  if (!command) return false;

  return (
    command.visibleByDefault ||
    hasFlag(command.discoveredFlag) ||
    hasDiscoveredVerb(commandId)
  );
}

function discoverCommand(commandId) {
  const command = commandRegistry[commandId];

  if (!command || command.visibleByDefault) return;

  if (command.discoveredFlag) {
    setFlag(command.discoveredFlag);
  }

  // Übergangslösung für alte Saves / alte Kapitel-Logik
  discoverVerb(commandId);
}

function getCommandBlockReason(commandId) {
  const command = commandRegistry[commandId];

  if (!command || !command.blockedWhen) return null;

  if (command.blockedWhen()) {
    return command.blockedText || "SYSTEM HINT: Command aktuell gesperrt.";
  }

  return null;
}

function canUseCommand(commandId) {
  const blockReason = getCommandBlockReason(commandId);

  if (blockReason) {
    showParserHint(blockReason);
    return false;
  }

  return true;
}

let selectedCommandId = "gehe";

function updateHelpMenu() {
  const index = document.getElementById("commandIndex");
  const details = document.getElementById("commandDetails");

  if (!index || !details) return;

  index.innerHTML = "";

const categoryOrder = [
  "NAVIGATION",
  "INTERACTION",
  "SYSTEM"
];

categoryOrder.forEach(category => {
  const categoryCommands =
    Object.values(commandRegistry)
      .filter(command =>
        command.category === category
      )
      .sort((a, b) => {
        const aKnown =
          isCommandDiscovered(a.id);

        const bKnown =
          isCommandDiscovered(b.id);

        // bekannte Commands zuerst
        if (aKnown !== bKnown) {
          return bKnown - aKnown;
        }

        // dann feste Reihenfolge
        return (a.order || 999) -
               (b.order || 999);
      });

  if (categoryCommands.length === 0) {
    return;
  }

  const categoryHeader =
    document.createElement("div");

  categoryHeader.className =
    "command-category-header";

  categoryHeader.textContent =
    category;

  index.appendChild(categoryHeader);

  categoryCommands.forEach(command => {
    const isDiscovered =
      isCommandDiscovered(command.id);

    const isSelected =
      command.id === selectedCommandId;

    const blockReason =
      getCommandBlockReason(command.id);

    const button =
      document.createElement("button");

    button.type = "button";
    button.className =
      "command-index-entry";

    if (isSelected) {
      button.classList.add("active");
    }

    if (!isDiscovered) {
      button.classList.add("undiscovered");
    }

    if (
      blockReason &&
      isDiscovered
    ) {
      button.classList.add("blocked");
    }

    button.innerHTML = `
      <span class="command-index-label">
        ${
          isDiscovered
            ? command.label
            : "???"
        }
      </span>
    `;

    button.addEventListener(
      "click",
      () => {
        selectedCommandId =
          command.id;

        updateHelpMenu();
      }
    );

    index.appendChild(button);
  });
});
}

function renderCommandDetails(commandId) {
  const details = document.getElementById("commandDetails");
  const command = commandRegistry[commandId];

  if (!details || !command) return;

  const isDiscovered = isCommandDiscovered(command.id);

  if (!isDiscovered) {
    details.innerHTML = `
      <div class="command-detail-locked">
        <h4>UNKNOWN PROTOCOL</h4>

        <div class="command-detail-code">???</div>

        <p>
          Command documentation unavailable.<br>
          Interaction pattern not yet indexed.
        </p>
      </div>
    `;

    return;
  }

  const blockReason = getCommandBlockReason(command.id);

  details.innerHTML = `
    <div class="command-detail-header">
      <h4>${command.label}</h4>
      <span>${command.category}</span>
    </div>

    <div class="command-detail-code">
      ${command.syntax}
    </div>

    <p class="command-detail-description">
      ${command.description}
    </p>

    ${
      blockReason
        ? `
          <div class="command-detail-warning">
            ${blockReason.replace("SYSTEM HINT: ", "")}
          </div>
        `
        : ""
    }

    ${
      command.examples && command.examples.length > 0
        ? `
          <div class="example-label">BEISPIELE</div>

          <div class="example">
            ${command.examples
              .map(example => `&gt; ${example}`)
              .join("<br>")}
          </div>
        `
        : ""
    }
  `;
}
function hasItem(itemId) {
  return gameState.inventory.includes(itemId);
}

function discoverVerb(verb) {
  if (!gameState.discoveredVerbs.includes(verb)) {
    gameState.discoveredVerbs.push(verb);
    updateHelpMenu();
  }
}
function setFlag(flag, value = true) {
  gameState.flags[flag] = value;
}

function hasFlag(flag) {
  return gameState.flags[flag] === true;
}
function setHealth(state) {
  const validStates = ["healthy", "light", "severe", "dead"];

  if (!validStates.includes(state)) {
    console.warn("Invalid health state:", state);
    return;
  }

  gameState.health = state;
  updateStatusPanel();
}

function injure(level = "light") {
  if (gameState.health === "dead") return;

  if (level === "light" && gameState.health === "healthy") {
    gameState.health = "light";
    return;
  }

  if (level === "severe") {
    gameState.health = "severe";
    return;
  }

  if (level === "dead") {
    gameState.health = "dead";
  }
  updateStatusPanel();
}

function heal() {
  if (gameState.health === "severe") {
    gameState.health = "light";
    updateStatusPanel();
    return;
  }

  if (gameState.health === "light") {
    gameState.health = "healthy";
    updateStatusPanel();
  }
}
const SAVE_PREFIX = "aurelion_slot_";
const SLOT_COUNT = 3;
const PROFILE_VERSION = 2;

const CHAPTER_ORDER = [
  "tutorial",
  "chapter01"
];

let activeSlot = null;
let selectedSlotForChapterSelect = null;

function getSlotKey(slotId) {
  return SAVE_PREFIX + slotId;
}

function createEmptyProfile(slotId) {
  return {
    version: PROFILE_VERSION,
    slotId,
    activeChapterId: null,
    unlockedChapters: ["tutorial", "chapter01"],
    completedChapters: [],
    chapterSaves: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function isProfileSave(data) {
  return data && data.chapterSaves;
}

function getProfileFromSlot(slotId) {
  const savedData = localStorage.getItem(getSlotKey(slotId));

  if (!savedData) return null;

  try {
    const data = JSON.parse(savedData);

    if (isProfileSave(data)) {
      return data;
    }

    // Migration alter Einzel-Saves
    if (data.chapterId) {
      const profile = createEmptyProfile(slotId);
      profile.activeChapterId = data.chapterId;
      profile.chapterSaves[data.chapterId] = data;
      profile.createdAt = data.createdAt || profile.createdAt;
      profile.updatedAt = data.lastSavedAt || profile.updatedAt;
      writeProfileToSlot(slotId, profile);
      return profile;
    }

    return null;
  } catch (error) {
    console.warn("Defekter Speicherstand:", slotId, error);
    return null;
  }
}

function writeProfileToSlot(slotId, profile) {
  profile.updatedAt = new Date().toISOString();

  localStorage.setItem(
    getSlotKey(slotId),
    JSON.stringify(profile)
  );
}

function getSaveSlotData(slotId) {
  return getProfileFromSlot(slotId);
}

function saveGame() {
  if (!activeSlot) {
    showSystemToast("Kein aktives Profil ausgewählt.");
    return;
  }

  const profile =
    getProfileFromSlot(activeSlot) ||
    createEmptyProfile(activeSlot);

  gameState.lastSavedAt = new Date().toISOString();

  profile.activeChapterId = gameState.chapterId;
  profile.chapterSaves[gameState.chapterId] = gameState;

  writeProfileToSlot(activeSlot, profile);
}

function loadGameFromSlot(slotId) {
  const profile = getProfileFromSlot(slotId);

  if (!profile || !profile.activeChapterId) {
    return false;
  }

  const chapterSave =
    profile.chapterSaves[profile.activeChapterId];

  if (!chapterSave) {
    return false;
  }

  gameState = chapterSave;
  activeSlot = slotId;
  return true;
}

function getPreviousChapterId(chapterId) {
  const index = CHAPTER_ORDER.indexOf(chapterId);

  if (index <= 0) return null;

  return CHAPTER_ORDER[index - 1];
}

function getCarryOverForChapter(profile, chapterId) {
  const previousChapterId = getPreviousChapterId(chapterId);

  if (!previousChapterId) {
    return {};
  }

  const previousSave =
    profile.chapterSaves[previousChapterId];

  if (!previousSave) {
    return {};
  }

  return {
    inventory: [...(previousSave.inventory || [])],
    discoveredVerbs: [...(previousSave.discoveredVerbs || [])],
    health: previousSave.health || "healthy"
  };
}

function createChapterGameState(chapterId, carryOver = {}) {
  const state = createInitialGameState(chapterId);

  state.inventory = [...(carryOver.inventory || [])];
  state.discoveredVerbs = [...(carryOver.discoveredVerbs || [])];
  state.health = carryOver.health || "healthy";

  state.createdAt = new Date().toISOString();
  state.lastSavedAt = new Date().toISOString();

  return state;
}

function resetGame() {
  if (activeSlot) {
    localStorage.removeItem(getSlotKey(activeSlot));
  }

  gameState = createInitialGameState();
  activeSlot = null;

  renderSaveSlots();
  showSaveHub();
}
function getFlag(flag) {
  return gameState.flags[flag];
}
function hasDiscoveredVerb(verb) {
  return gameState.discoveredVerbs.includes(verb);
}
function currentRoom() {
  return currentChapter().rooms[gameState.room];
}

function currentArea() {
  return currentRoom().areas[gameState.area];
}
function getItemData(itemId) {
  const room = currentRoom();

  if (!room.items) return null;

  return room.items[itemId] || null;
}

function getItemName(itemId) {
  const itemData = getItemData(itemId);

  if (!itemData) return itemId;

  return itemData.name || itemId;
}
function getDetailData(detailId) {
  const room = currentRoom();

  if (!room.details) return null;

  return room.details[detailId] || null;
}

function getDetailText(detailId) {
  const detailData = getDetailData(detailId);

  if (!detailData) {
    return "Du findest nichts Auffälliges.";
  }

  return detailData.text || "Du findest nichts Auffälliges.";
}

function shouldShowDetail(detailId) {
  const detailData = getDetailData(detailId);

  if (
    detailData &&
    typeof detailData === "object" &&
    detailData.hideWhenInInventory &&
    hasItem(detailData.hideWhenInInventory)
  ) {
    return false;
  }

  return true;
}
function isVisibleDetail(target) {
  const area = currentArea();

  if (!area.details || !Array.isArray(area.details)) {
    return false;
  }

  return area.details.some(detail => {
    return normalizeText(detail) === normalizeText(target);
  });
}
function getRoomInteraction(type, target) {
  const room = currentRoom();

  if (
    !room.interactions ||
    !room.interactions[type] ||
    !room.interactions[type][target]
  ) {
    return null;
  }

  return room.interactions[type][target];
}

function runRoomInteraction(type, target) {
  const interaction = getRoomInteraction(type, target);

  if (!interaction) return false;

  interaction();
  return true;
}
function getUseInteraction(item, target) {
  const room = currentRoom();

  if (
    !room.interactions ||
    !room.interactions.use ||
    !room.interactions.use[item] ||
    !room.interactions.use[item][target]
  ) {
    return null;
  }

  return room.interactions.use[item][target];
}

function runUseInteraction(item, target) {
  const interaction = getUseInteraction(item, target);

  if (!interaction) return false;

  interaction();
  return true;
}
function getCombineInteraction(itemA, itemB) {
  const room = currentRoom();

  if (!room.interactions || !room.interactions.combine) {
    return null;
  }

  const keyA = `${itemA}+${itemB}`;
  const keyB = `${itemB}+${itemA}`;

  return (
    room.interactions.combine[keyA] ||
    room.interactions.combine[keyB] ||
    null
  );
}

function runCombineInteraction(itemA, itemB) {
  const interaction =
    getCombineInteraction(itemA, itemB);

  if (!interaction) return false;

  interaction();
  return true;
}
function addObservation(text) {
  if (!gameState.observations.includes(text)) {
    gameState.observations.push(text);
    updateObservationsLog();
  }
}

function updateObservationsLog() {
  const list = document.getElementById("observationsList");

  if (!list) return;

  list.innerHTML = "";

  if (gameState.observations.length === 0) {
    const li = document.createElement("li");
    li.className = "observation-card empty-observation";
    li.textContent = "No relevant observations recorded.";
    list.appendChild(li);
    return;
  }

  gameState.observations.forEach((observation, index) => {
    const li = document.createElement("li");
    li.className = "observation-card";

    li.innerHTML = `
      <strong>LOG ${String(index + 1).padStart(3, "0")}</strong>

      <div class="observation-text">
        ${observation}
      </div>
    `;

    list.appendChild(li);
  });
}
function updateChapterScrollbar() {
  const scroll = document.getElementById("chapterSelectScroll");
  const thumb = document.getElementById("chapterScrollThumb");

  if (!scroll || !thumb) return;

  const scrollTop = scroll.scrollTop;
  const scrollHeight = scroll.scrollHeight;
  const clientHeight = scroll.clientHeight;

  const maxScroll = scrollHeight - clientHeight;

  if (maxScroll <= 0) {
    thumb.style.display = "none";
    return;
  }

  thumb.style.display = "block";

  const thumbHeight =
    (clientHeight / scrollHeight) * clientHeight;

  const maxThumbMove =
    clientHeight - thumbHeight;

  const thumbTop =
    (scrollTop / maxScroll) * maxThumbMove;

  thumb.style.height =
    `${Math.max(40, thumbHeight)}px`;

  thumb.style.transform =
    `translateY(${thumbTop}px)`;
}
function openHelp() {
  document.getElementById("helpOverlay").classList.remove("hidden");

  requestAnimationFrame(() => {
    updateHelpScrollbar();
  });
}

function closeHelp() {
  document.getElementById("helpOverlay").classList.add("hidden");
}

document.getElementById("closeHelp").addEventListener("click", closeHelp);
document.getElementById("openTerminal").addEventListener("click", openHelp);
document.getElementById("helpOverlay").addEventListener("click", function (event) {
  if (event.target.id === "helpOverlay") {
    closeHelp();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeHelp();
    closeSystemMenu();
  }
});
function openSystemMenu() {
  document
    .getElementById("systemMenuOverlay")
    .classList.remove("hidden");
}

function closeSystemMenu() {
  document
    .getElementById("systemMenuOverlay")
    .classList.add("hidden");
}

function showSystemToast(message) {
  const toast =
    document.getElementById("systemToast");

  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2600);
}
function triggerHelpFlicker() {
  const helpBox = document.getElementById("helpBox");

  helpBox.classList.remove("flicker");
  void helpBox.offsetWidth;
  helpBox.classList.add("flicker");
}

document.querySelectorAll(".help-tab").forEach(button => {
  button.addEventListener("click", () => {
    const helpBox = document.getElementById("helpBox");
    const tabName = button.dataset.tab;

    document
      .querySelectorAll(".help-tab")
      .forEach(tab =>
        tab.classList.remove("active")
      );

    document
      .querySelectorAll(".help-content")
      .forEach(content =>
        content.classList.remove("active-tab")
      );

    button.classList.add("active");

    if (tabName === "general") {
      helpBox.classList.remove("field-mode");
      helpBox.classList.remove("observation-mode");

      document
        .getElementById("generalTab")
        .classList.add("active-tab");
    }

    if (tabName === "observations") {
      helpBox.classList.remove("field-mode");
      helpBox.classList.add("observation-mode");

      document
        .getElementById("observationsTab")
        .classList.add("active-tab");
    }

    triggerHelpFlicker();
    updateHelpScrollbar();
  });
});
function showAreaDescription() {
  const area = currentArea();

  const formattedText = area.description
    .split("\n\n")
    .map(paragraph => `<p>${paragraph}</p>`)
    .join("");

  document.getElementById("storyContent").innerHTML =
  `<h3 class="story-location">${area.name}</h3><div class="story-text">${formattedText}</div>`;
}
function updateHelpScrollbar() {
  const scroll = document.getElementById("helpScroll");
  const thumb = document.getElementById("scrollThumb");

  if (!scroll || !thumb) return;

  const scrollTop = scroll.scrollTop;
  const scrollHeight = scroll.scrollHeight;
  const clientHeight = scroll.clientHeight;

  const maxScroll = scrollHeight - clientHeight;

  if (maxScroll <= 0) {
  thumb.style.display = "none";
  return;
}

  thumb.style.display = "block";

  const thumbHeight =
    (clientHeight / scrollHeight) *
    scroll.clientHeight;

  const maxThumbMove =
    scroll.clientHeight - thumbHeight;

  const thumbTop =
    (scrollTop / maxScroll) *
    maxThumbMove;

  thumb.style.height =
    `${Math.max(40, thumbHeight)}px`;

  thumb.style.transform =
    `translateY(${thumbTop}px)`;
}

document
  .getElementById("helpScroll")
  .addEventListener("scroll", updateHelpScrollbar);

window.addEventListener(
  "resize",
  updateHelpScrollbar
);

updateHelpScrollbar();
function render() {
  const room = currentRoom();
  const area = currentArea();

  document.getElementById("location").textContent = room.location;
  document.getElementById("objective").textContent =
    "PRIMARY OBJECTIVE: " + room.objective;

  showAreaDescription();

  updateStatusPanel();
  updateEnvironment();
  updateInventory();
  updateHelpMenu();
  updateObservationsLog();

}

function renderList(id, items) {
  const element = document.getElementById(id);
  element.innerHTML = "";

  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  });
}
function updateStatusPanel() {
  const element = document.getElementById("statusList");

  if (!element) return;

  element.innerHTML = "";

  const status = getHealthStatusDisplay();

  addStatusLine(
    element,
    "Bioscan:",
    status.label,
    status.className
  );

  addStatusLine(
    element,
    "Warning:",
    status.warning,
    status.className
  );
}

function getHealthStatusDisplay() {
  const states = {
    healthy: {
      label: "stabil",
      warning: "keine akute Warnung",
      className: "health-healthy"
    },

    light: {
      label: "leicht verletzt",
      warning: "körperliche Belastung erhöht",
      className: "health-light"
    },

    severe: {
      label: "kritisch verletzt",
      warning: "medizinische Versorgung erforderlich",
      className: "health-severe"
    },

    dead: {
      label: "keine Vitalwerte",
      warning: "Systemfehler: Subjekt nicht reaktionsfähig",
      className: "health-dead"
    }
  };

  return states[gameState.health] || states.healthy;
}

function addStatusLine(parent, label, value, className) {
  const li = document.createElement("li");
  li.className = `status-entry ${className}`;

  li.innerHTML = `
    <span class="status-label">${label}</span>
    <span class="status-value">${value}</span>
  `;

  parent.appendChild(li);
}
function updateEnvironment() {
  const area = currentArea();
  const element = document.getElementById("hotspots");

  element.innerHTML = "";

  addEnvironmentLine(
    element,
    "Accessible:",
    "environment-heading"
  );

  const exits = Object.values(area.exits || {});

  if (exits.length === 0) {
    addEnvironmentLine(
      element,
      "keine offensichtlichen Wege",
      "area-exit"
    );
    return;
  }

  exits.forEach(exit => {
    const wasVisited = gameState.visitedAreas.includes(exit.target);

    const label = wasVisited
      ? exit.discoveredLabel
      : exit.hiddenLabel;

    const className = wasVisited
      ? "area-exit visited-area"
      : "area-exit";

    addEnvironmentLine(
      element,
      `${exit.display}: ${label}`,
      className
    );
  });
}

function addEnvironmentLine(parent, text, className) {
  const li = document.createElement("li");
  li.textContent = text;
  li.className = className;
  parent.appendChild(li);
}

function updateInventory() {
  const element = document.getElementById("inventory");
  element.innerHTML = "";

  if (gameState.inventory.length === 0) {
  return;
}

  gameState.inventory.forEach(itemId => {
    const li = document.createElement("li");
    li.className = "inventory-item";
    li.textContent = getItemName(itemId);
    element.appendChild(li);
  });
}

function normalizeCommand(command) {
  command = command.trim().toLowerCase();
  command = command
  .replaceAll("ä", "ae")
  .replaceAll("ö", "oe")
  .replaceAll("ü", "ue")
  .replaceAll("ß", "ss");

  const commandAliases = {
  "nehmen": "nimm",
  "nehme": "nimm",
  "take": "nimm",
  "pick": "nimm",

  "schau": "untersuche",
  "schaue": "untersuche",
  "sieh": "untersuche",
  "siehe": "untersuche",
  "inspect": "untersuche",
  "look": "untersuche",

  "geh": "gehe",
  "laufe": "gehe",
  "lauf": "gehe",
  "go": "gehe",

  "kombiniere": "kombiniere",
  "combine": "kombiniere",
  "verbinde": "kombiniere",
    
  "nutze": "benutze",
  "verwende": "benutze",
  "use": "benutze",

  "öffne": "oeffne",
  "open": "oeffne"
};

let words = command.split(" ");

if (words.length > 0 && commandAliases[words[0]]) {
  words[0] = commandAliases[words[0]];
}

command = words.join(" ");
  

  const fillerWords = [
     "nach",
  "zum",
  "zur",
  "zu",
  "in",
  "an",
  "am",
  "auf",
  "mit",
  "den",
  "dem",
  "das",
  "die",
  "der",
  "ein",
  "eine",
  "einen",
  "einem",
  "mir",
  "mal",
  "bitte",
  "und",
  "and"
  ];

  words = command.split(" ");
  words = words.filter(word => !fillerWords.includes(word));
  const aliases = currentAliases();

words = words.map(word => aliases[word] || word);

  return normalizeText(words.join(" "));
}

function handleCommand(input) {
  const command = normalizeCommand(input);
  clearParserHint();

  if (!command) return;

  if (
  command === "terminal" ||
  command === "hilfe" ||
  command === "menu" ||
  command === "menue"
) {
  openHelp();
  return;
}

  if (command === "umsehen") {
  if (!canUseCommand("umsehen")) return;

  showAreaDescription();
  updateEnvironment();
  return;
}
  if (command === "hint") {
  if (!canUseCommand("hint")) return;

  showHint();
  return;
}

if (command.startsWith("hint ")) {
  if (!canUseCommand("hint")) return;

  const target = command.replace("hint ", "");
  showHint(target);
  return;
}

  if (command.startsWith("gehe ")) {
  if (!canUseCommand("gehe")) return;

  const target = command.replace("gehe ", "");
  goToArea(target);
  return;
}

  if (command.startsWith("untersuche ")) {
  if (!canUseCommand("untersuche")) return;

  const target = command.replace("untersuche ", "");
  examine(target);
  return;
}

  if (command.startsWith("nimm ")) {
  if (!canUseCommand("nimm")) return;

  const target = command.replace("nimm ", "");
  takeItem(target);
  return;
}
  if (command.startsWith("oeffne ")) {
  if (!canUseCommand("oeffne")) return;

  const target = command.replace("oeffne ", "");
  openObject(target);
  return;
}

  if (command.startsWith("benutze ")) {
  if (!canUseCommand("benutze")) return;

  useItem(command.replace("benutze ", ""));
  return;
}
  if (command.startsWith("kombiniere ")) {
  if (!isCommandDiscovered("kombiniere")) {
    showUnknownCommand();
    return;
  }

  if (!canUseCommand("kombiniere")) return;

  combineItems(command.replace("kombiniere ", ""));
  return;
}

showUnknownCommand();
}
function showHint(target = null) {
  const hint = getMatchingHint(target);

  if (!hint) {
    showParserHint(
      "SYSTEM HINT: Keine spezifischen Hinweise verfügbar.\nPrüfe deine Umgebung erneut oder öffne den TERMINAL unten links."
    );

    return;
  }

  showParserHint(
    "SYSTEM HINT: " + hint
  );
}

function getMatchingHint(target = null) {
  const area = currentArea();
  const hints = area.hints;

  if (!hints) return null;

  if (target) {
    return getTargetHint(hints, target);
  }

  return getGeneralHint(hints);
}

function getGeneralHint(hints) {
  if (!hints.general || !Array.isArray(hints.general)) {
    return null;
  }

  const matchingHint = hints.general.find(hintRule => {
    if (!hintRule.when) return true;
    return hintRule.when();
  });

  return matchingHint ? matchingHint.text : null;
}

function getTargetHint(hints, target) {
  if (!hints.targets) return null;

  const normalizedTarget = normalizeText(target);

  const targetKey = Object.keys(hints.targets).find(key => {
    return normalizeText(key) === normalizedTarget;
  });

  if (!targetKey) return null;

  const targetHints = hints.targets[targetKey];

  if (!Array.isArray(targetHints)) return null;

  const matchingHint = targetHints.find(hintRule => {
    if (!hintRule.when) return true;
    return hintRule.when();
  });

  return matchingHint ? matchingHint.text : null;
}
function normalizeText(text) {
  return text
    .trim()
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss");
}
function goToArea(target) {
  const room = currentRoom();
  const area = currentArea();

  let targetAreaId = null;
  const exits = Object.entries(area.exits);

  // 1. Richtung prüfen, z. B. vorne, links, zurueck
  if (area.exits[target]) {
    targetAreaId = area.exits[target].target;
  }
  // gehe zu Detail → freundlich umleiten
if (!targetAreaId && isVisibleDetail(target)) {
  showText(getRandomApproachText(target));

  showParserHint(
    `SYSTEM HINT: Für eine genauere Betrachtung nutze „untersuche ${target}“.`
  );

  return;
}
  // 2. Label prüfen, z. B. "verwachsener waldweg"
  if (!targetAreaId) {
    const matchingExits = exits.filter(([direction, exitData]) => {
      return (
        normalizeText(exitData.hiddenLabel) === normalizeText(target) ||
        normalizeText(exitData.discoveredLabel) === normalizeText(target)
      );
    });

    if (matchingExits.length === 1) {
      targetAreaId = matchingExits[0][1].target;
    }

    if (matchingExits.length > 1) {
      showText(
        "Das ist nicht eindeutig. Es gibt mehrere passende Wege. Nutze eine Richtung."
      );
      return;
    }
  }

  // 3. Direkter Area-Key prüfen, z. B. haupttor
  if (!targetAreaId && room.areas[target]) {
    const possibleExits = Object.values(area.exits).map(exit => exit.target);

    if (possibleExits.includes(target)) {
      targetAreaId = target;
    }
  }

  if (!targetAreaId) {
    const areaExists = Object.values(room.areas).some(area =>
      normalizeText(area.name) === normalizeText(target)
    );

    if (room.areas[target] || areaExists) {
      showText("Diesen Ort kannst du von hier aus nicht erreichen.");
    } else {
      showText("Ich verstehe nicht, wohin du gehen möchtest.");
    }

    return;
  }

  gameState.area = targetAreaId;

  if (!gameState.visitedAreas.includes(targetAreaId)) {
    gameState.visitedAreas.push(targetAreaId);
  }

  showAreaDescription();
  updateEnvironment();
}

function examine(target) {
  const room = currentRoom();
  const area = currentArea();

  if (room.areas[target]) {
    if (gameState.area === target) {
      showText(area.description);
      return;
    }

    const possibleExits = Object.values(area.exits).map(exit => exit.target);

    if (possibleExits.includes(target)) {
      showText(`${room.areas[target].name} liegt in der Nähe.`);
showParserHint(`SYSTEM HINT: Distanz zu Zielbereich zu hoch für detaillierte Analyse.`);
return;
    }

    showText("Von hier aus kannst du diesen Ort nicht genauer erkennen.");
    return;
  }

  if (!area.details.includes(target)) {
    showText("Das kannst du von hier aus nicht untersuchen.");
    return;
  }
runRoomInteraction("examine", target);

showText(getDetailText(target));
}

function takeItem(target) {
  const area = currentArea();

  if (!area.details.includes(target)) {
    showText("Das kannst du hier nicht nehmen.");
    return;
  }

  const wasHandled = runRoomInteraction("take", target);

  if (wasHandled) return;

  showText("Das lässt sich nicht sinnvoll mitnehmen.");
}
function openObject(target) {
  const area = currentArea();

  if (!area.details.includes(target)) {
    showText("Das kannst du hier nicht öffnen.");
    return;
  }

  const wasHandled = runRoomInteraction("open", target);

  if (wasHandled) return;

  showText("Das lässt sich nicht öffnen.");
}
function useItem(commandRest) {
  const parts = commandRest.split(" ");

  if (parts.length < 2) {
    showParserHint("SYSTEM HINT: Interaktion unvollständig. Zielobjekt nicht spezifiziert.");
return;
  }

  const item = parts[0];
  const target = parts.slice(1).join(" ");

  const wasHandled = runUseInteraction(item, target);

  if (wasHandled) return;

  showText("Das scheint hier nichts zu bewirken.");
}
function combineItems(commandRest) {
  const parts = commandRest.split(" ");

  if (parts.length < 2) {
    showParserHint("SYSTEM HINT: Kombinationsprozess unvollständig. Zusätzliche Komponente erforderlich.");
return;
  }

  const itemA = parts[0];
  const itemB = parts.slice(1).join(" ");

  if (!hasItem(itemA)) {
    showText("Du hast " + itemA + " nicht im Inventar.");
    return;
  }

  if (!hasItem(itemB)) {
    showText("Du hast " + itemB + " nicht im Inventar.");
    return;
  }

  const wasHandled =
    runCombineInteraction(itemA, itemB);

  if (wasHandled) return;

  showText("Diese Objekte lassen sich nicht sinnvoll kombinieren.");
}
function showText(text) {
  document.getElementById("storyContent").innerHTML =
    `<div class="story-text">${text.replace(/\n/g, "<br>")}</div>`;
}
function showParserHint(text) {
  const hint = document.getElementById("parserHint");

  if (!hint) return;

  hint.innerHTML = text.replace(/\n/g, "<br>");
  hint.classList.remove("hidden");
}
function clearParserHint() {
  const hint = document.getElementById("parserHint");

  if (!hint) return;

  hint.textContent = "";
  hint.classList.add("hidden");
}
function getRandomApproachText(target) {
  const texts = [
    `Du trittst näher heran.`,
    `Du näherst dich vorsichtig.`,
    `Du gehst ein paar Schritte darauf zu.`,
    `Du bringst dich in eine bessere Position.`,
    `Du rückst näher an ${target} heran.`
  ];

  return texts[Math.floor(Math.random() * texts.length)];
}
document.getElementById("commandForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const input = document.getElementById("commandInput");
  handleCommand(input.value);
  input.value = "";
});
function formatSaveDate(isoString) {
  if (!isoString) return "Unbekannt";

  const date = new Date(isoString);

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function getChapterTitle(chapterId) {
  const titles = {
  tutorial: "Tutorial – Systemeinweisung",
  chapter01: "Kapitel 1 – Eintritt in Aurelion"
};

  return titles[chapterId] || chapterId;
}

function hideAllStartScreens() {
  document
    .querySelectorAll("#startScreen .menu-screen")
    .forEach(screen => {
      screen.classList.add("hidden");
    });
}

function showLanding() {
  document.getElementById("game").classList.add("hidden");
  document.getElementById("startScreen").classList.remove("hidden");

  hideAllStartScreens();

  document
    .getElementById("landingScreen")
    .classList.remove("hidden");
}

function showSaveHub() {
  document.getElementById("game").classList.add("hidden");
  document.getElementById("startScreen").classList.remove("hidden");

  hideAllStartScreens();
  renderSaveSlots();

  document
    .getElementById("saveHubScreen")
    .classList.remove("hidden");
}

function showChapterSelect(slotId) {
  selectedSlotForChapterSelect = slotId;

  hideAllStartScreens();
  renderChapterCards(slotId);

  document
    .getElementById("chapterSelectScreen")
    .classList.remove("hidden");

  requestAnimationFrame(() => {
    updateChapterScrollbar();
  });
}

function showGame() {
  document
    .getElementById("startScreen")
    .classList.add("hidden");

  document
    .getElementById("game")
    .classList.remove("hidden");

  render();
}

function renderSaveSlots() {
  const container = document.getElementById("saveSlots");
  container.innerHTML = "";

  for (let slotId = 1; slotId <= SLOT_COUNT; slotId++) {
    const saveData = getSaveSlotData(slotId);
const hasChapterSaves =
  saveData &&
  saveData.chapterSaves &&
  Object.keys(saveData.chapterSaves).length > 0;

const card = document.createElement("div");
card.className = hasChapterSaves ? "save-card" : "save-card empty";

    if (hasChapterSaves) {
      card.innerHTML = `
  <div class="save-card-header">
    <h2>PROFIL ${String(slotId).padStart(2, "0")}</h2>

    <button
      class="delete-slot-button"
      data-action="delete"
      data-slot="${slotId}"
      title="Spielstand löschen"
      aria-label="Spielstand löschen">
      ×
    </button>
  </div>

  <div class="save-meta">
          ${getChapterTitle(saveData.activeChapterId)}<br>
Kapitel-Saves: ${Object.keys(saveData.chapterSaves).length}<br>
Letzter Zugriff: ${formatSaveDate(saveData.updatedAt)}
        </div>

        <div class="save-actions">
          <button data-action="continue" data-slot="${slotId}">
            > FORTSETZEN
          </button>

          <button class="slot-secondary" data-action="chapters" data-slot="${slotId}">
            > KAPITELAUSWAHL
          </button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <h2>PROFIL ${String(slotId).padStart(2, "0")}</h2>

        <div class="save-meta">
          Kein lokaler Zugangspunkt registriert.
        </div>

        <div class="save-actions">
          <button data-action="new" data-slot="${slotId}">
            > NEUES SPIEL
          </button>
        </div>
      `;
    }

    container.appendChild(card);
  }

  container
    .querySelectorAll("button[data-action]")
    .forEach(button => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        const slotId = Number(button.dataset.slot);

        if (action === "continue") {
          continueSlot(slotId);
        }

        if (action === "new") {
          showChapterSelect(slotId);
        }

        if (action === "chapters") {
          showChapterSelect(slotId);
        }
        if (action === "delete") {
          deleteSlot(slotId);
        }
      });
    });
}

function renderChapterCards(slotId) {
  const label = document.getElementById("chapterProfileLabel");
  const container = document.getElementById("chapterCards");
  const profile = getSaveSlotData(slotId);

  label.textContent = `PROFIL ${String(slotId).padStart(2, "0")}`;
  container.innerHTML = "";

  renderChapterCard({
    container,
    slotId,
    chapterId: "tutorial",
    title: "TUTORIAL",
    subtitle: "Systemeinweisung",
    status: getChapterStatus(profile, "tutorial"),
    locked: false
  });

  renderChapterCard({
    container,
    slotId,
    chapterId: "chapter01",
    title: "KAPITEL 1",
    subtitle: "Eintritt in Aurelion",
    status: getChapterStatus(profile, "chapter01"),
    locked: false
  });

  renderChapterCard({
    container,
    slotId,
    chapterId: "chapter02",
    title: "KAPITEL 2",
    subtitle: "Zugriff verweigert",
    status: "Weitere Freigabe ausstehend.",
    locked: true
  });
}

function getChapterStatus(profile, chapterId) {
  if (!profile) {
    return "neuer Zugriffspunkt";
  }

  if (profile.chapterSaves && profile.chapterSaves[chapterId]) {
    return "Spielstand vorhanden";
  }

  const previousChapterId = getPreviousChapterId(chapterId);

  if (
    previousChapterId &&
    profile.chapterSaves &&
    profile.chapterSaves[previousChapterId]
  ) {
    return "bereit mit Übergabezustand";
  }

  return "neuer Zugriffspunkt";
}
function renderChapterCard({
  container,
  slotId,
  chapterId,
  title,
  subtitle,
  status,
  locked
}) {
  const card = document.createElement("div");
  card.className = locked ? "chapter-card locked" : "chapter-card";

  const profile = getProfileFromSlot(slotId);
  const hasSave =
    profile &&
    profile.chapterSaves &&
    profile.chapterSaves[chapterId];

  card.innerHTML = `
    <h2>${title}</h2>

    <div class="chapter-meta">
      ${subtitle}<br>
      Status: ${status}
    </div>

    <div class="chapter-actions">
      <button
        class="chapter-enter-btn"
        ${locked ? "disabled" : ""}
      >
        > ${locked ? "GESPERRT" : "BETRETEN"}
      </button>

      ${
        hasSave && !locked
          ? `
            <button class="chapter-reset-btn">
              > KAPITEL ZURÜCKSETZEN
            </button>
          `
          : ""
      }
    </div>
  `;

  container.appendChild(card);

  const enterButton = card.querySelector(".chapter-enter-btn");

  if (!locked) {
    enterButton.addEventListener("click", () => {
      startChapterInSlot(slotId, chapterId);
    });
  }

  const resetButton = card.querySelector(".chapter-reset-btn");

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      confirmChapterReset(slotId, chapterId);
    });
  }
}
function continueSlot(slotId) {
  const loaded = loadGameFromSlot(slotId);

  if (!loaded) {
    showSystemToast("Kein Speicherstand in diesem Profil gefunden.");
    renderSaveSlots();
    return;
  }

  showGame();
}
let pendingConfirmAction = null;

function openConfirmDialog({ title, message, confirmText, onConfirm }) {
  pendingConfirmAction = onConfirm;

  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMessage").innerHTML =
    message.replace(/\n/g, "<br>");

  document.getElementById("confirmActionBtn").textContent = confirmText;

  document
    .getElementById("confirmOverlay")
    .classList.remove("hidden");
}

function closeConfirmDialog() {
  pendingConfirmAction = null;

  document
    .getElementById("confirmOverlay")
    .classList.add("hidden");
}
function deleteSlot(slotId) {
  openConfirmDialog({
    title: "SPIELSTAND LÖSCHEN",
    message:
      `PROFIL ${String(slotId).padStart(2, "0")} wirklich löschen?\n\n` +
      "Dieser Spielstand kann nicht wiederhergestellt werden.",
    confirmText: "LÖSCHEN",
    onConfirm: () => {
      localStorage.removeItem(getSlotKey(slotId));

      if (activeSlot === slotId) {
        activeSlot = null;
      }

      renderSaveSlots();

      showSystemToast(
        `PROFIL ${String(slotId).padStart(2, "0")} gelöscht.`
      );
    }
  });
}
function confirmChapterReset(slotId, chapterId) {
  openConfirmDialog({
    title: "KAPITEL ZURÜCKSETZEN",
    message:
      `${getChapterTitle(chapterId)} wirklich zurücksetzen?\n\n` +
      "Der Spielstand dieses Kapitels wird gelöscht. Spätere Kapitel bleiben erhalten.",
    confirmText: "ZURÜCKSETZEN",
    onConfirm: () => {
      resetChapterSave(slotId, chapterId);
    }
  });
}

function resetChapterSave(slotId, chapterId) {
  const profile = getProfileFromSlot(slotId);

  if (!profile || !profile.chapterSaves) return;

  delete profile.chapterSaves[chapterId];

  if (profile.activeChapterId === chapterId) {
    profile.activeChapterId = null;
  }

  writeProfileToSlot(slotId, profile);

  renderChapterCards(slotId);
  updateChapterScrollbar();

  showSystemToast(
    `${getChapterTitle(chapterId)} zurückgesetzt.`
  );
}
function startChapterInSlot(slotId, chapterId) {
  const profile =
    getProfileFromSlot(slotId) ||
    createEmptyProfile(slotId);

  activeSlot = slotId;

  // Existierenden Kapitel-Save laden
  if (profile.chapterSaves[chapterId]) {
    gameState = profile.chapterSaves[chapterId];
    profile.activeChapterId = chapterId;
    writeProfileToSlot(slotId, profile);
    showGame();
    return;
  }

  // Neuen Kapitel-Save mit Übergabezustand erstellen
  const carryOver =
    getCarryOverForChapter(profile, chapterId);

  gameState = createChapterGameState(chapterId, carryOver);

  profile.activeChapterId = chapterId;
  profile.chapterSaves[chapterId] = gameState;

  writeProfileToSlot(slotId, profile);

  showGame();
}
document
  .getElementById("chapterSelectScroll")
  .addEventListener("scroll", updateChapterScrollbar);

window.addEventListener(
  "resize",
  updateChapterScrollbar
);
document
  .getElementById("enterAurelionBtn")
  .addEventListener("click", showSaveHub);

document
  .getElementById("backToLandingBtn")
  .addEventListener("click", showLanding);

document
  .getElementById("backToSaveHubBtn")
  .addEventListener("click", showSaveHub);

document
  .getElementById("settingsBtn")
  .addEventListener("click", () => {
    showSystemToast("SYSTEM SETTINGS:\nNoch nicht verfügbar.");
  });

document
  .getElementById("openSystemMenu")
  .addEventListener("click", openSystemMenu);

document
  .getElementById("resumeBtn")
  .addEventListener("click", closeSystemMenu);

document
  .getElementById("saveBtn")
  .addEventListener("click", () => {
    saveGame();
    closeSystemMenu();

    showSystemToast(
      "AURELION BACKUP NODE:\nLokaler Zustand gesichert."
    );
  });

document
  .getElementById("returnToMenuBtn")
  .addEventListener("click", () => {
    closeSystemMenu();
    showSaveHub();
  });
document
  .getElementById("cancelConfirmBtn")
  .addEventListener("click", closeConfirmDialog);

document
  .getElementById("confirmActionBtn")
  .addEventListener("click", () => {
    if (pendingConfirmAction) {
      pendingConfirmAction();
    }

    closeConfirmDialog();
  });

document
  .getElementById("confirmOverlay")
  .addEventListener("click", event => {
    if (event.target.id === "confirmOverlay") {
      closeConfirmDialog();
    }
  });
showLanding();
