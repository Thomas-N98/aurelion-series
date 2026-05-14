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
  const chapterHint = currentChapter().unknownCommandHint;

  if (chapterHint) {
    return chapterHint;
  }

  return (
    "Befehl nicht erkannt.\n\n" +
    "TERMINAL-HINWEIS:\n" +
    "Schreibe „hilfe“ oder öffne den TERMINAL unten links, um bekannte Interaktionsmuster abzurufen."
  );
}

const secretVerbs = [
  {
    id: "oeffne",
    label: "öffne",
    description:
      "Open containers, doors or mechanisms.",
    examples: [
      "öffne auto",
      "öffne schloss"
    ]
  },
  {
    id: "lies",
    label: "lies",
    description:
      "Read signs, notes or labels.",
    examples: [
      "lies warnschild",
      "lies notiz"
    ]
  },
  {
    id: "ziehe",
    label: "ziehe",
    description:
      "Pull handles, levers or loose objects.",
    examples: [
      "ziehe hebel",
      "ziehe kabel"
    ]
  },
  {
  id: "kombiniere",
  label: "kombiniere",
  description:
    "Combine objects to create something new.",
  examples: [
    "kombiniere kabel batterie",
    "kombiniere karte leser"
  ]
}
];

function updateHelpMenu() {
  const list = document.getElementById("discoveredVerbs");

  if (!list) return;

  list.innerHTML = "";

  secretVerbs.forEach(verb => {
    const li = document.createElement("li");
    li.className = "field-card";

    if (hasDiscoveredVerb(verb.id)) {
      li.innerHTML = `
  <strong>${verb.label}</strong>

  <div class="field-description-card">
    ${verb.description}
  </div>

  <div class="example-label">
    BEISPIELE
  </div>

  <div class="example">
    ${verb.examples
      .map(example => `&gt; ${example}`)
      .join("<br>")}
  </div>
`;
    } else {
      li.innerHTML = `
        <strong class="locked-command">
          ???
        </strong>

        <div class="field-description-card locked-text">
          Unknown interaction pattern.<br>
          No documentation available.
        </div>
      `;
    }

    list.appendChild(li);
  });
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

let activeSlot = null;
let selectedSlotForChapterSelect = null;

function getSlotKey(slotId) {
  return SAVE_PREFIX + slotId;
}

function saveGame() {
  if (!activeSlot) {
    showSystemToast("Kein aktives Profil ausgewählt.");
    return;
  }

  gameState.lastSavedAt = new Date().toISOString();

  localStorage.setItem(
    getSlotKey(activeSlot),
    JSON.stringify(gameState)
  );
}

function loadGameFromSlot(slotId) {
  const savedData = localStorage.getItem(getSlotKey(slotId));

  if (!savedData) {
    return false;
  }

  gameState = JSON.parse(savedData);
  activeSlot = slotId;
  return true;
}

function createNewGameInSlot(slotId, chapterId = "chapter01") {
  gameState = createInitialGameState(chapterId);
  activeSlot = slotId;

  gameState.createdAt = new Date().toISOString();
  gameState.lastSavedAt = new Date().toISOString();

  localStorage.setItem(
    getSlotKey(slotId),
    JSON.stringify(gameState)
  );
}

function getSaveSlotData(slotId) {
  const savedData = localStorage.getItem(getSlotKey(slotId));

  if (!savedData) {
    return null;
  }

  try {
    return JSON.parse(savedData);
  } catch (error) {
    console.warn("Defekter Speicherstand:", slotId, error);
    return null;
  }
}

function resetGame() {
  if (activeSlot) {
    localStorage.removeItem(getSlotKey(activeSlot));
  }

  gameState = createInitialGameState();
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

    if (tabName === "fieldnotes") {
      helpBox.classList.add("field-mode");
      helpBox.classList.remove("observation-mode");

      document
        .getElementById("fieldnotesTab")
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

  document.getElementById("story").innerHTML =
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
  thumb.style.display = "block";
  thumb.style.height = "100%";
  thumb.style.transform = "translateY(0)";
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
    const li = document.createElement("li");
    li.className = "inventory-empty";
    li.textContent = "Inventory empty";
    element.appendChild(li);
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
    showAreaDescription();
    updateEnvironment();
    return;
  }

  if (command.startsWith("gehe ")) {
    const target = command.replace("gehe ", "");
    goToArea(target);
    return;
  }

  if (command.startsWith("untersuche ")) {
    const target = command.replace("untersuche ", "");
    examine(target);
    return;
  }

  if (command.startsWith("nimm ")) {
    const target = command.replace("nimm ", "");
    takeItem(target);
    return;
  }
  if (command.startsWith("oeffne ")) {
  const target = command.replace("oeffne ", "");
  openObject(target);
  return;
  }

  if (command.startsWith("benutze ")) {
    useItem(command.replace("benutze ", ""));
    return;
  }
  if (command.startsWith("kombiniere ")) {
    if (!hasDiscoveredVerb("kombiniere")) {
      showText(getUnknownCommandHint());
      return;
    }

    combineItems(command.replace("kombiniere ", ""));
    return;
  }
  showText(getUnknownCommandHint());
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
      showText(
        `${room.areas[target].name} liegt in der Nähe. Geh näher heran, um den Ort genauer zu untersuchen.`
      );
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
    showText("Woran möchtest du das benutzen?");
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
    showText("Welche zwei Objekte möchtest du kombinieren?");
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
  document.getElementById("story").innerHTML =
    `<div class="story-text">${text.replace(/\n/g, "<br>")}</div>`;
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

    const card = document.createElement("div");
    card.className = saveData ? "save-card" : "save-card empty";

    if (saveData) {
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
          ${getChapterTitle(saveData.chapterId)}<br>
          Bereich: ${saveData.area || "Unbekannt"}<br>
          Letzter Zugriff: ${formatSaveDate(saveData.lastSavedAt)}
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
  const saveData = getSaveSlotData(slotId);

  label.textContent = `PROFIL ${String(slotId).padStart(2, "0")}`;
  container.innerHTML = "";

  renderChapterCard({
    container,
    slotId,
    chapterId: "tutorial",
    title: "TUTORIAL",
    subtitle: "Systemeinweisung",
    status: "sofort zugänglich",
    locked: false
  });

  renderChapterCard({
    container,
    slotId,
    chapterId: "chapter01",
    title: "KAPITEL 1",
    subtitle: "Eintritt in Aurelion",
    status: saveData ? "verfügbar" : "neuer Zugriffspunkt",
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

  card.innerHTML = `
    <h2>${title}</h2>

    <div class="chapter-meta">
      ${subtitle}<br>
      Status: ${status}
    </div>

    <button ${locked ? "disabled" : ""}>
      > ${locked ? "GESPERRT" : "BETRETEN"}
    </button>
  `;

  container.appendChild(card);

  if (!locked) {
    card
      .querySelector("button")
      .addEventListener("click", () => {
        startChapterInSlot(slotId, chapterId);
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
function startChapterInSlot(slotId, chapterId) {
  const existingSave = getSaveSlotData(slotId);

  if (!existingSave) {
    createNewGameInSlot(slotId, chapterId);
    showGame();
    return;
  }

  gameState = {
    ...createInitialGameState(chapterId),
    createdAt: existingSave.createdAt || new Date().toISOString(),
    lastSavedAt: new Date().toISOString()
  };

  activeSlot = slotId;

  localStorage.setItem(
    getSlotKey(slotId),
    JSON.stringify(gameState)
  );

  showGame();
}

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
