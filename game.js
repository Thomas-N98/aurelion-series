const gameState = {
  room: "outside",
  area: "außenbereich",
  visitedAreas: ["außenbereich"],
  inventory: []
};

const rooms = {
  outside: {
    location: "AURELION INDUSTRIES ",

    commands: [
      "umsehen",
      "gehe zu/nach",
      "untersuche",
      "benutze",
      "nimm",
      "hilfe"
    ],

    areas: {
      außenbereich: {
        name: "Außenbereich",
        description:
          "Du stehst vor dem Gelände von Aurelion Industries.\n\nDas Gebäude wirkt verlassen, aber irgendwo hinter den dunklen Fenstern flackert Licht.",
        exits: ["haupttor", "wartungsrohr", "firmenschild", "zaunbereich"],
        details: []
      },

      haupttor: {
        name: "Haupttor",
        description:
          "Du stehst direkt vor dem massiven Haupttor von Aurelion Industries.\n\nAus der Nähe erkennst du mehrere technische Vorrichtungen.",
        exits: ["außenbereich", "zaunbereich"],
        details: ["kamera", "kartenleser", "schloss"]
      },

      wartungsrohr: {
        name: "Wartungsrohr",
        description:
          "Du stehst bei einem alten Wartungsrohr am Rand des Gebäudes.\n\nZwischen Laub, Schmutz und Beton liegt etwas Halbverdecktes.",
        exits: ["außenbereich"],
        details: ["zugangskarte"]
      },

      firmenschild: {
        name: "Firmenschild",
        description:
          "Du stehst vor einem verwitterten Firmenschild.\n\nDie Buchstaben sind teilweise abgekratzt, aber der Name AURELION ist noch klar zu erkennen.",
        exits: ["außenbereich"],
        details: ["schriftzug"]
      },

      zaunbereich: {
        name: "Zaunbereich",
        description:
          "Du stehst an einem beschädigten Abschnitt des Zauns.\n\nHier wirkt das Gelände weniger überwacht, aber nicht unbedingt einladender.",
        exits: ["außenbereich", "haupttor", "waldweg"],
        details: ["zaun", "warnschild"]
      },

      waldweg: {
        name: "Waldweg",
        description:
          "Ein schmaler Waldweg führt vom Firmengelände weg.\n\nDer Boden ist feucht. Zwischen den Bäumen erkennst du Reifenspuren.",
        exits: ["zaunbereich"],
        details: ["reifenspuren"]
      }
    },

    details: {
      kamera:
        "Die Kamera folgt deinen Bewegungen. Ein kleines rotes Licht blinkt im Takt.",

      kartenleser:
        "Der Kartenleser ist alt, aber noch aktiv. Ein schwaches grünes Licht pulsiert unter der zerkratzten Oberfläche.",

      schloss:
        "Das Schloss wirkt mechanisch, aber es scheint zusätzlich elektronisch blockiert zu sein.",

      zugangskarte:
        "Die Zugangskarte liegt halb verdeckt im Schmutz. Vielleicht funktioniert sie noch.",

      schriftzug:
        "Auf dem Schild steht:\n\nAURELION INDUSTRIES\nFortschritt ist Gehorsam.",

      zaun:
        "Der Zaun ist beschädigt, aber nicht völlig offen. Jemand hat ihn notdürftig zurückgebogen.",

      warnschild:
        "Auf dem Warnschild steht:\n\nBETRETEN VERBOTEN\nSICHERHEITSSYSTEM AKTIV",

      reifenspuren:
        "Die Reifenspuren sehen frisch aus. Offenbar ist dieser Ort nicht so verlassen, wie er wirken soll."
    }
  }
};

const aliases = {
  tor: "haupttor",
  rohr: "wartungsrohr",
  schild: "firmenschild",
  zaun: "zaunbereich",
  weg: "waldweg",
  karte: "zugangskarte"
};

function hasItem(item) {
  return gameState.inventory.includes(item);
}

function currentRoom() {
  return rooms[gameState.room];
}

function currentArea() {
  return currentRoom().areas[gameState.area];
}

function render() {
  const room = currentRoom();
  const area = currentArea();

  document.getElementById("location").textContent =
    `${room.location} // ${area.name}`;

  document.getElementById("story").textContent = area.description;

  renderList("commands", room.commands);
  updateEnvironment();
  updateInventory();
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
  const room = currentRoom();
  const area = currentArea();
  const element = document.getElementById("hotspots");

  element.innerHTML = "";

  addEnvironmentLine(element, `▶ ${area.name}`, "current-area");

  addEnvironmentLine(element, "Details hier:", "environment-heading");

  const visibleDetails = area.details.filter(detail => {
    if (detail === "zugangskarte" && hasItem("Zugangskarte")) {
      return false;
    }

    return true;
  });

  if (visibleDetails.length === 0) {
    addEnvironmentLine(element, "leer", "empty-detail");
  } else {
    visibleDetails.forEach(detail => {
      addEnvironmentLine(element, detail, "area-detail");
    });
  }

  addEnvironmentLine(element, "Nahe Orte:", "environment-heading");

  area.exits.forEach(exitId => {
    const exit = room.areas[exitId];

    const className = gameState.visitedAreas.includes(exitId)
      ? "area-exit visited-area"
      : "area-exit";

    addEnvironmentLine(element, exit.name, className);
  });
}

function addEnvironmentLine(parent, text, className) {
  const li = document.createElement("li");
  li.textContent = text;
  li.className = className;
  parent.appendChild(li);
}

function updateInventory() {
  renderList(
    "inventory",
    gameState.inventory.length ? gameState.inventory : ["leer"]
  );
}

function normalizeCommand(command) {
  command = command.trim().toLowerCase();

  if (command.startsWith("nehmen ")) {
    command = command.replace("nehmen", "nimm");
  }

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
    "der"
  ];

  let words = command.split(" ");
  words = words.filter(word => !fillerWords.includes(word));

  words = words.map(word => aliases[word] || word);

  return words.join(" ");
}

function handleCommand(input) {
  const command = normalizeCommand(input);

  if (!command) return;

  if (command === "hilfe") {
    showText(
      "Mögliche Eingaben:\n\numsehen\ngehe zum haupttor\ngehe zum wartungsrohr\ngehe zurück\nuntersuche kartenleser\nuntersuche zugangskarte\nnimm zugangskarte\nbenutze zugangskarte kartenleser"
    );
    return;
  }

  if (command === "umsehen") {
    showText(currentArea().description);
    updateEnvironment();
    return;
  }

  if (command === "gehe zurück") {
    goToArea("außenbereich");
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

  if (command.startsWith("benutze ")) {
    useItem(command.replace("benutze ", ""));
    return;
  }

  showText(
    "Befehl nicht erkannt.\n\nTipp: Nutze Eingaben wie:\n- umsehen\n- gehe zum haupttor\n- untersuche kartenleser\n- nimm zugangskarte"
  );
}

function goToArea(targetAreaId) {
  const room = currentRoom();
  const area = currentArea();

  if (!room.areas[targetAreaId]) {
    showText("Diesen Ort gibt es hier nicht.");
    return;
  }

  if (!area.exits.includes(targetAreaId)) {
    showText("Von hier aus kommst du dort nicht direkt hin.");
    return;
  }

  gameState.area = targetAreaId;

  if (!gameState.visitedAreas.includes(targetAreaId)) {
    gameState.visitedAreas.push(targetAreaId);
  }

  showText(currentArea().description);
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

    if (area.exits.includes(target)) {
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

  showText(room.details[target] || "Du findest nichts Auffälliges.");
}

function takeItem(target) {
  const area = currentArea();

  if (!area.details.includes(target)) {
    showText("Das kannst du hier nicht nehmen.");
    return;
  }

  if (target === "zugangskarte") {
    if (hasItem("Zugangskarte")) {
      showText("Du hast die Zugangskarte bereits.");
      return;
    }

    gameState.inventory.push("Zugangskarte");
    showText("Du hebst die schmutzige Zugangskarte auf.");
    updateInventory();
    updateEnvironment();
    return;
  }

  showText("Das lässt sich nicht sinnvoll mitnehmen.");
}

function useItem(commandRest) {
  const parts = commandRest.split(" ");

  if (parts.length < 2) {
    showText("Woran möchtest du das benutzen?");
    return;
  }

  const item = parts[0];
  const target = parts.slice(1).join(" ");

  if (item === "zugangskarte" && target === "kartenleser") {
    if (gameState.area !== "haupttor") {
      showText("Hier gibt es keinen Kartenleser.");
      return;
    }

    if (!hasItem("Zugangskarte")) {
      showText("Du hast keine Zugangskarte.");
      return;
    }

    showText(
      "Der Kartenleser piept.\n\nZUGRIFF GEWÄHRT.\n\nDas Haupttor öffnet sich einen Spalt breit. Dahinter liegt der Eingangsbereich von Aurelion."
    );
    return;
  }

  if (item === "zugangskarte" && target === "haupttor") {
    showText("Vielleicht solltest du die Zugangskarte direkt am Kartenleser benutzen.");
    return;
  }

  showText("Das scheint hier nichts zu bewirken.");
}

function showText(text) {
  document.getElementById("story").textContent = text;
}

document.getElementById("commandForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const input = document.getElementById("commandInput");
  handleCommand(input.value);
  input.value = "";
});

render();
