alert("game.js lädt");
const gameState = {
  room: "outside",
  focus: null,
  inventory: []
};

function hasItem(item) {
  return gameState.inventory.includes(item);
}

const rooms = {
  outside: {
    location: "AURELION INDUSTRIES // Außenbereich",

    description:
      "Du stehst vor dem Haupttor von Aurelion Industries.\n\nDas Gebäude wirkt verlassen, aber irgendwo hinter den dunklen Fenstern flackert Licht.\n\nEine Kamera bewegt sich langsam in deine Richtung.",

    commands: [
      "umsehen",
      "gehe zu/nach",
      "untersuche",
      "benutze",
      "nimm",
      "hilfe"
    ],

    hotspots: {
      global: ["tor", "kamera", "schild", "rohr"],
      tor: ["kartenleser", "schloss"],
      rohr: ["zugangskarte"]
    },

    actions: {
      "umsehen": () => {
        if (gameState.focus === "tor") {
          return "Du stehst direkt vor dem Haupttor.\n\nIn Reichweite erkennst du:\n- kartenleser\n- schloss";
        }

        if (gameState.focus === "rohr") {
          return "Du stehst bei dem alten Rohr.\n\nDahinter liegen Schmutz, Laub und eine schmutzige Zugangskarte.";
        }

        return rooms[gameState.room].description;
      },

      "hilfe":
        "Mögliche Eingaben:\n\numsehen\ngehe zum tor\ngehe zum rohr\ngehe zurück\nuntersuche tor\nuntersuche kartenleser\nuntersuche rohr\nnimm zugangskarte\nbenutze zugangskarte tor\ninventar",

      "inventar": () => {
        if (gameState.inventory.length === 0) {
          return "Dein Inventar ist leer.";
        }

        return "Inventar:\n- " + gameState.inventory.join("\n- ");
      },

      "gehe tor": () => {
        gameState.focus = "tor";
        updateHotspots();

        return "Du trittst näher an das Haupttor heran.\n\nAus der Nähe erkennst du einen Kartenleser und ein altes Schloss.";
      },

      "gehe rohr": () => {
        gameState.focus = "rohr";
        updateHotspots();

        return "Du gehst zu dem alten Rohr.\n\nDahinter scheint etwas im Schmutz zu liegen.";
      },

      "gehe zurück": () => {
        gameState.focus = null;
        updateHotspots();

        return rooms[gameState.room].description;
      },

      "gehe links":
        "Links endet der Zaun an einem überwucherten Wartungsweg. Noch ist dort nichts Interessantes.",

      "gehe rechts":
        "Rechts findest du nur weitere Betonwand, Dornen und eine beunruhigend neue Überwachungskamera.",

      "untersuche tor": () => {
        if (gameState.focus !== "tor") {
          return "Das Tor ist zu weit entfernt. Geh näher heran, um es genauer zu untersuchen.";
        }

        return "Das Tor ist massiv und elektronisch verriegelt. Daneben befindet sich ein Kartenleser.";
      },

      "untersuche kartenleser": () => {
        if (gameState.focus !== "tor") {
          return "Dafür müsstest du näher an das Tor herangehen.";
        }

        return "Der Kartenleser ist alt, aber noch aktiv. Ein schwaches grünes Licht pulsiert unter der zerkratzten Oberfläche.";
      },

      "untersuche schloss": () => {
        if (gameState.focus !== "tor") {
          return "Das Schloss erkennst du von hier aus nicht genau genug.";
        }

        return "Das Schloss wirkt mechanisch, aber es scheint zusätzlich elektronisch blockiert zu sein.";
      },

      "untersuche kamera":
        "Die Kamera folgt deinen Bewegungen. Ein kleines rotes Licht blinkt im Takt.",

      "untersuche schild":
        "Auf dem Schild steht:\n\nAURELION INDUSTRIES\nFortschritt ist Gehorsam.",

      "untersuche rohr": () => {
        if (gameState.focus !== "rohr") {
          return "Von hier aus siehst du nur ein altes Rohr. Vielleicht solltest du näher herangehen.";
        }

        return "Hinter dem Rohr liegt eine schmutzige Zugangskarte.";
      },

      "untersuche zugangskarte": () => {
        if (hasItem("Zugangskarte")) {
          return "Die Zugangskarte ist zerkratzt, aber der Magnetstreifen sieht noch halbwegs intakt aus.";
        }

        if (gameState.focus !== "rohr") {
          return "Du siehst hier keine Zugangskarte.";
        }

        return "Die Zugangskarte liegt halb verdeckt im Schmutz. Vielleicht funktioniert sie noch.";
      },

      "nimm zugangskarte": () => {
        if (gameState.focus !== "rohr") {
          return "Du siehst hier keine Zugangskarte.";
        }

        if (hasItem("Zugangskarte")) {
          return "Du hast die Zugangskarte bereits.";
        }

        gameState.inventory.push("Zugangskarte");
        updateInventory();

        return "Du hebst die schmutzige Zugangskarte auf.";
      },

      "öffne tor": () => {
        if (gameState.focus !== "tor") {
          return "Dafür musst du näher an das Tor herangehen.";
        }

        return "Das Tor bleibt geschlossen. Ohne gültige Autorisierung passiert hier gar nichts.";
      },

      "benutze zugangskarte tor": () => {
        if (gameState.focus !== "tor") {
          return "Du bist zu weit vom Tor entfernt.";
        }

        if (!hasItem("Zugangskarte")) {
          return "Du hast keine Zugangskarte.";
        }

        return "Der Kartenleser piept.\n\nZUGRIFF GEWÄHRT.\n\nDas Tor öffnet sich einen Spalt breit. Dahinter liegt der Eingangsbereich von Aurelion.";
      },

      "benutze zugangskarte kartenleser": () => {
        if (gameState.focus !== "tor") {
          return "Du bist zu weit vom Kartenleser entfernt.";
        }

        if (!hasItem("Zugangskarte")) {
          return "Du hast keine Zugangskarte.";
        }

        return "Der Kartenleser piept.\n\nZUGRIFF GEWÄHRT.\n\nDas Tor öffnet sich einen Spalt breit. Dahinter liegt der Eingangsbereich von Aurelion.";
      }
    }
  }
};

function render() {
  const room = rooms[gameState.room];

  document.getElementById("location").textContent = room.location;
  document.getElementById("story").textContent = room.description;

  renderList("commands", room.commands);
  updateHotspots();
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
function renderHotspots(room) {
  const element = document.getElementById("hotspots");
  element.innerHTML = "";

  room.hotspots.global.forEach(hotspot => {
    const li = document.createElement("li");

if (gameState.focus === hotspot) {
  li.innerHTML = `<strong>${hotspot}</strong>`;
} else {
  li.textContent = hotspot;
}

    if (gameState.focus === hotspot && room.hotspots[hotspot]) {
      const subList = document.createElement("ul");

      room.hotspots[hotspot].forEach(subHotspot => {
        const subLi = document.createElement("li");
        subLi.textContent = subHotspot;
        subList.appendChild(subLi);
      });

      li.appendChild(subList);
    }

    element.appendChild(li);
  });
}
function getVisibleHotspots(room) {
  const visible = [...room.hotspots.global];

  if (gameState.focus && room.hotspots[gameState.focus]) {
    visible.push(...room.hotspots[gameState.focus]);
  }

  return visible;
}

function updateHotspots() {
  const room = rooms[gameState.room];
  renderList("hotspots", getVisibleHotspots(room));
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

  return words.join(" ");
}

function handleCommand(input) {
  const command = normalizeCommand(input);
  const room = rooms[gameState.room];

  if (!command) return;

  const action = room.actions[command];

  if (!action) {
    showText(
      "Befehl nicht erkannt.\n\nTipp: Nutze Eingaben wie:\n- umsehen\n- gehe zum tor\n- gehe zum rohr\n- untersuche kartenleser\n- nimm zugangskarte\n- benutze zugangskarte tor"
    );
    return;
  }

  if (typeof action === "function") {
    showText(action());
  } else {
    showText(action);
  }

  updateInventory();
  updateHotspots();
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
