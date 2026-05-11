const gameState = {
  room: "outside",
  area: "parkplatz",
  visitedAreas: ["parkplatz"],
  inventory: []
};

const rooms = {
  outside: {
    location: "AURELION INDUSTRIES // PERIMETER ZONE",
    objective: "Gain facility access",

    commands: [
      "umsehen",
      "gehe zu/nach",
      "untersuche",
      "benutze",
      "nimm",
      "hilfe"
    ],

    areas: {
  parkplatz: {
    name: "Wanderparkplatz",
    description:
      "Du stehst auf einem abgelegenen Wanderparkplatz. Dein Auto steht neben dir, dahinter die lange, schlängelnde Straße, die dich tief in den Wald geführt hat.\n\nMehrere Wege führen von hier aus zwischen den Bäumen hindurch. Vermutlich führt einer davon zum alten Firmengelände, aber noch siehst du nichts außer Wald, Schotter und verblasste Markierungen.\n\nAn einem der Wege steht ein alter Wegweiser.\n\nEs ist still. Fast ein bisschen zu still.",
    exits: {
      hinten: {
        target: "waldweg_hinten",
        label: "steiler Waldpfad",
        display: "hinter dir"
      },
      links: {
        target: "waldweg_links",
        label: "blockierter Pfad",
        display: "links"
      },
      vorne: {
        target: "waldweg_vorne",
        label: "verwachsener Waldweg",
        display: "vor dir"
      },
      straße: {
        target: "straße",
        label: "Landstraße",
        display: "zur Straße"
      }
    },
    details: ["auto", "wegweiser"]
  },

  waldweg_hinten: {
    name: "Steiler Waldpfad",
    description:
      "Der Weg führt zunächst parallel zur Straße, biegt dann aber ab und wird deutlich steiler.\n\nDu bist dir ziemlich sicher, dass du hier nicht richtig bist. Aber vielleicht kannst du von weiter oben etwas erkennen.",
    exits: {
      zurueck: {
        target: "parkplatz",
        label: "Wanderparkplatz",
        display: "zurück"
      },
      weiter: {
        target: "waldweg_hinten2",
        label: "noch steilerer Pfad",
        display: "weiter oben"
      }
    },
    details: []
  },

  waldweg_hinten2: {
    name: "Aussichtspunkt",
    description:
      "Keuchend erreichst du einen kleinen Aussichtspunkt. Eine Felsformation gibt den Blick über den Wald frei. Daneben steht eine alte Holzbank zwischen ein paar Bäumen.\n\nIn der Ferne erkennst du das verfallene Firmengelände. Leider liegt es eindeutig in der anderen Richtung.\n\nVom Parkplatz aus wäre wohl der vordere Weg richtig gewesen.",
    exits: {
      zurueck: {
        target: "parkplatz",
        label: "Wanderparkplatz",
        display: "zurück"
      }
    },
    details: ["bank", "firmengelände"]
  },

  waldweg_links: {
    name: "Blockierter Pfad",
    description:
      "Nach kurzer Zeit stehst du vor einem Feld aus umgestürzten Bäumen.\n\nDer Weg ist blockiert. Morsche Stämme, nasses Laub und Dornen machen ziemlich deutlich, dass du hier nicht weitergehen solltest.",
    exits: {
      zurueck: {
        target: "parkplatz",
        label: "Wanderparkplatz",
        display: "zurück"
      }
    },
    details: ["baumstämme"]
  },

  waldweg_vorne: {
    name: "Verwachsener Waldweg",
    description:
      "Der Weg führt eine ganze Weile kerzengerade durch den Wald.\n\nJe weiter du gehst, desto ungepflegter wird er. Das Unkraut reicht dir inzwischen bis an die Schuhe, und zwischen den Bäumen liegt ein feuchter, metallischer Geruch.\n\nNach einer Weile gelangst du an einen alten Zaun. In der Ferne erkennst du erste Umrisse des Firmengeländes.",
    exits: {
      zurueck: {
        target: "parkplatz",
        label: "Wanderparkplatz",
        display: "zurück"
      },
      links: {
        target: "zaunbereich_links",
        label: "Zaunverlauf nach links",
        display: "links"
      },
      rechts: {
        target: "zaunbereich_rechts",
        label: "Zaunverlauf nach rechts",
        display: "rechts"
      }
    },
    details: ["zaun", "firmengelände"]
  },

  straße: {
    name: "Landstraße",
    description:
      "Die Straße führt in die Richtung zurück, aus der du gekommen bist. Irgendwo dort liegt das kleine Dorf mit deiner schäbigen Unterkunft.\n\nIn die andere Richtung verliert sie sich zwischen den Bäumen. Auf der Fahrt hierher hast du kein einziges anderes Auto gesehen.\n\nHier wirst du nicht weiterkommen.",
    exits: {
      zurueck: {
        target: "parkplatz",
        label: "Wanderparkplatz",
        display: "zurück"
      }
    },
    details: []
  },

  zaunbereich_links: {
    name: "Zaunverlauf links",
    description:
      "Du folgst dem Zaun nach links.\n\nDas Metall ist alt, aber noch stabil. Hinter dem Zaun liegt das überwucherte Gelände von Aurelion Industries.",
    exits: {
      zurueck: {
        target: "waldweg_vorne",
        label: "verwachsener Waldweg",
        display: "zurück"
      },
      rechts: {
        target: "zaunbereich_rechts",
        label: "Zaunverlauf nach rechts",
        display: "rechts"
      }
    },
    details: ["zaun", "warnschild"]
  },

  zaunbereich_rechts: {
    name: "Zaunverlauf rechts",
    description:
      "Du folgst dem Zaun nach rechts.\n\nZwischen zwei alten Pfosten erkennst du in einiger Entfernung das Haupttor.",
    exits: {
      zurueck: {
        target: "waldweg_vorne",
        label: "verwachsener Waldweg",
        display: "zurück"
      },
      links: {
        target: "zaunbereich_links",
        label: "Zaunverlauf nach links",
        display: "links"
      },
      weiter: {
        target: "haupttor",
        label: "massives Haupttor",
        display: "weiter vorne"
      }
    },
    details: ["zaun", "haupttor"]
  },

  haupttor: {
    name: "Haupttor",
    description:
      "Du stehst direkt vor dem massiven Haupttor von Aurelion Industries.\n\nAus der Nähe erkennst du mehrere technische Vorrichtungen.",
    exits: {
      zurueck: {
        target: "zaunbereich_rechts",
        label: "Zaunverlauf",
        display: "zurück"
      },
      links: {
        target: "wartungsrohr",
        label: "Gebäudeseite",
        display: "links"
      }
    },
    details: ["kamera", "kartenleser", "schloss"]
  },

  wartungsrohr: {
    name: "Wartungsrohr",
    description:
      "Du stehst bei einem alten Wartungsrohr am Rand des Gebäudes.\n\nZwischen Laub, Schmutz und Beton liegt etwas Halbverdecktes.",
    exits: {
      zurueck: {
        target: "haupttor",
        label: "Haupttor",
        display: "zurück"
      }
    },
    details: ["zugangskarte"]
  }
},

    details: {
      auto:
        "Dein Auto steht verlassen auf dem Parkplatz. Es wirkt plötzlich deutlich weniger beruhigend als noch vor ein paar Minuten.",

      wegweiser:
        "Der Wegweiser ist alt und teilweise überwachsen. Die Richtungsschilder sind kaum noch lesbar.\n\nEin Pfeil zeigt nach vorne. Darunter steht verblasst: INDUSTRIEGELÄNDE.",

      kamera:
        "Die Kamera folgt deinen Bewegungen. Ein kleines rotes Licht blinkt im Takt.",

      kartenleser:
        "Der Kartenleser ist alt, aber noch aktiv. Ein schwaches grünes Licht pulsiert unter der zerkratzten Oberfläche.",

      schloss:
        "Das Schloss wirkt mechanisch, aber es scheint zusätzlich elektronisch blockiert zu sein.",

      zugangskarte:
        "Die Zugangskarte liegt halb verdeckt im Schmutz. Vielleicht funktioniert sie noch.",

      zaun:
        "Der Zaun ist beschädigt, aber nicht völlig offen. Jemand hat ihn notdürftig zurückgebogen.",

      warnschild:
        "Auf dem Warnschild steht:\n\nBETRETEN VERBOTEN\nSICHERHEITSSYSTEM AKTIV",

      reifenspuren:
        "Die Reifenspuren sehen frisch aus. Offenbar ist dieser Ort nicht so verlassen, wie er wirken soll.",

      bank:
        "Die Bank ist feucht, morsch und mit Moos überwachsen. Jemand hat etwas in das Holz geritzt: KEIN SIGNAL.",

      firmengelände:
        "Zwischen den Baumwipfeln erkennst du das verfallene Firmengelände. Selbst aus der Entfernung wirkt es zu groß für etwas, das angeblich aufgegeben wurde.",

      baumstämme:
        "Die Baumstämme liegen kreuz und quer über dem Weg. Einige sehen frisch gebrochen aus."
    }
  }
};

const aliases = {
  tor: "haupttor",
  rohr: "wartungsrohr",
  karte: "zugangskarte",
  auto: "auto",
  wegweiser: "wegweiser"
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

function openHelp() {
  document.getElementById("helpOverlay").classList.remove("hidden");
}

function closeHelp() {
  document.getElementById("helpOverlay").classList.add("hidden");
}

document.getElementById("closeHelp").addEventListener("click", closeHelp);

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
function showAreaDescription() {
  const area = currentArea();

  const formattedText = area.description
    .split("\n\n")
    .map(paragraph => `<p>${paragraph}</p>`)
    .join("");

  document.getElementById("story").innerHTML =
    `<h3 class="story-location">${area.name}</h3><div class="story-text">${formattedText}</div>`;
}
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

  const visibleDetails = area.details.filter(detail => {
    if (
      detail === "zugangskarte" &&
      hasItem("Zugangskarte")
    ) {
      return false;
    }

    return true;
  });

  if (visibleDetails.length === 0) {
    addEnvironmentLine(
      element,
      "empty",
      "empty-detail"
    );
  } else {
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

    const className =
      gameState.visitedAreas.includes(exit.target)
        ? "area-exit visited-area"
        : "area-exit";

    addEnvironmentLine(
      element,
      `${exit.display}: ${exit.label}`,
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
  renderList(
    "inventory",
    gameState.inventory
  );
}

function normalizeCommand(command) {
  command = command.trim().toLowerCase();
  command = command
  .replaceAll("ä", "ae")
  .replaceAll("ö", "oe")
  .replaceAll("ü", "ue")
  .replaceAll("ß", "ss");

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

  return normalizeText(words.join(" "));
}

function handleCommand(input) {
  const command = normalizeCommand(input);

  if (!command) return;

  if (command === "hilfe") {
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

  if (command.startsWith("benutze ")) {
    useItem(command.replace("benutze ", ""));
    return;
  }

  showText(
    "Befehl nicht erkannt.\n\nTipp: Nutze Eingaben wie:\n- umsehen\n- gehe nach vorne\n- gehe zurück\n- untersuche wegweiser\n- nimm zugangskarte"
  );
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

  // 1. Richtung prüfen, z. B. "links", "vorne", "zurück"
  if (area.exits[target]) {
    targetAreaId = area.exits[target].target;
  }

  // 2. Angezeigtes Label prüfen, z. B. "verwachsener waldweg"
  if (!targetAreaId) {
    const matchingExit = exits.find(([direction, exitData]) => {
      return normalizeText(exitData.label) === normalizeText(target);
    });

    if (matchingExit) {
      targetAreaId = matchingExit[1].target;
    }
  }

  // 3. Direkter Area-Name prüfen, z. B. "haupttor"
  if (!targetAreaId && room.areas[target]) {
    const possibleExits = Object.values(area.exits).map(exit => exit.target);

    if (possibleExits.includes(target)) {
      targetAreaId = target;
    }
  }

  if (!targetAreaId) {

  // existiert der Ort grundsätzlich?
  const areaExists = Object.values(room.areas).some(area =>
    normalizeText(area.name) === normalizeText(target)
  );

  if (room.areas[target] || areaExists) {
    showText(
      "Diesen Ort kannst du von hier aus nicht erreichen."
    );
  } else {
    showText(
      "Ich verstehe nicht, wohin du gehen möchtest."
    );
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
  document.getElementById("story").innerHTML =
    `<div class="story-text">
      ${text.replace(/\n/g, "<br>")}
    </div>`;
}

document.getElementById("commandForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const input = document.getElementById("commandInput");
  handleCommand(input.value);
  input.value = "";
});

render();
