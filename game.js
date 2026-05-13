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
}

function heal() {
  if (gameState.health === "severe") {
    gameState.health = "light";
    return;
  }

  if (gameState.health === "light") {
    gameState.health = "healthy";
  }
}
const SAVE_KEY = "aurelion_save_v1";

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

function loadGame() {
  const savedData = localStorage.getItem(SAVE_KEY);

  if (!savedData) {
    return false;
  }

  gameState = JSON.parse(savedData);
  return true;
}

function resetGame() {
  gameState = createInitialGameState();
  localStorage.removeItem(SAVE_KEY);
  render();
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
document.getElementById("openTerminal").addEventListener("click", openSystemMenu);
document.getElementById("helpOverlay").addEventListener("click", function (event) {
  if (event.target.id === "helpOverlay") {
    closeHelp();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeHelp();
  }
});
function openSystemMenu() {
  document
    .getElementById("systemMenu")
    .classList.remove("hidden");
}

function closeSystemMenu() {
  document
    .getElementById("systemMenu")
    .classList.add("hidden");
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

  renderList("commands", room.commands);
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

function updateEnvironment() {
  const area = currentArea();
  const element = document.getElementById("hotspots");

  element.innerHTML = "";

  // Details
  addEnvironmentLine(
    element,
    "Details here:",
    "environment-heading"
  );

  const visibleDetails =
  area.details.filter(shouldShowDetail);

  if (visibleDetails.length > 0) {
  visibleDetails.forEach(detail => {
    addEnvironmentLine(
      element,
      detail,
      "area-detail"
    );
  });
}

  // Nearby Areas
  addEnvironmentLine(
    element,
    "Nearby areas:",
    "environment-heading"
  );

  // WICHTIG: neue exits-Struktur
  Object.values(area.exits).forEach(exit => {
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
  const itemNames = gameState.inventory.map(getItemName);

  renderList("inventory", itemNames);
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
  "bitte"
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
function showGame() {
  document
    .getElementById("startScreen")
    .classList.add("hidden");

  document
    .getElementById("game")
    .classList.remove("hidden");

  render();
}

function startNewGame() {
  gameState =
    createInitialGameState();

  localStorage.removeItem(SAVE_KEY);

  showGame();
}

function continueGame() {
  const loaded = loadGame();

  if (!loaded) {
    showText(
      "Kein Speicherstand gefunden."
    );
    return;
  }

  showGame();
}
document
  .getElementById("newGameBtn")
  .addEventListener(
    "click",
    startNewGame
  );

document
  .getElementById("continueBtn")
  .addEventListener(
    "click",
    continueGame
  );

document
  .getElementById("settingsBtn")
  .addEventListener(
    "click",
    () => {
      alert("Settings coming soon.");
    }
  );
document
  .getElementById("saveBtn")
  .addEventListener("click", () => {
    saveGame();
    closeSystemMenu();
    alert("Spiel gespeichert.");
  });

document
  .getElementById("returnToMenuBtn")
  .addEventListener("click", () => {
    closeSystemMenu();

    document
      .getElementById("game")
      .classList.add("hidden");

    document
      .getElementById("startScreen")
      .classList.remove("hidden");
  });

document
  .getElementById("deleteSaveBtn")
  .addEventListener("click", () => {
    const confirmed = confirm(
      "Spielstand wirklich löschen?"
    );

    if (!confirmed) return;

    localStorage.removeItem(SAVE_KEY);

    document
      .getElementById("continueBtn")
      .disabled = true;

    closeSystemMenu();
  });

document
  .getElementById("closeSystemMenuBtn")
  .addEventListener(
    "click",
    closeSystemMenu
  );
if (localStorage.getItem(SAVE_KEY)) {
  document
    .getElementById("continueBtn")
    .disabled = false;
} else {
  document
    .getElementById("continueBtn")
    .disabled = true;
}
