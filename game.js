const gameState = {
  room: "outside",
  inventory: []
};

const rooms = {
  outside: {
    location: "AURELION INDUSTRIES // Außenbereich",
    description:
      "Du stehst vor dem Haupttor von Aurelion Industries.\n\nDas Gebäude wirkt verlassen, aber irgendwo hinter den dunklen Fenstern flackert Licht.\n\nEine Kamera bewegt sich langsam in eure Richtung.",

    commands: ["umsehen", "untersuche", "gehe zu/nach", "öffne", "benutze","nimm", "hilfe"],

    hotspots: ["tor", "kamera", "schild", "lampe", "rohr"],

    actions: {
       "umsehen": () => {
    return rooms[gameState.room].description;
  },
      "untersuche tor":
        "Das Tor ist massiv und elektronisch verriegelt. Daneben befindet sich ein Kartenleser.",

      "untersuche kamera":
        "Die Kamera folgt euren Bewegungen. Ein kleines rotes Licht blinkt im Takt.",

      "untersuche schild":
        "Auf dem Schild steht:\n\nAURELION INDUSTRIES\nFortschritt ist Gehorsam.",

      "untersuche lampe":
        "Die Lampe flackert. Nicht dramatisch genug für einen Kurzschluss, aber dramatisch genug für schlechte Entscheidungen.",

      "untersuche rohr":
        "Hinter dem Rohr liegt eine schmutzige Zugangskarte.",
      
      "nimm zugangskarte": () => {
        if (!gameState.inventory.includes("Zugangskarte")) {
          gameState.inventory.push("Zugangskarte");
          return "Ihr nehmt die Zugangskarte. Sie ist zerkratzt, aber vielleicht noch lesbar.";
        }
        return "Ihr habt die Zugangskarte bereits.";
      },
      "öffne tor":
        "Das Tor bleibt geschlossen. Ohne gültige Autorisierung passiert hier gar nichts.",

      "benutze karte tor":
        "Der Kartenleser piept.\n\nZUGRIFF GEWÄHRT.\n\nDas Tor öffnet sich einen Spalt breit. Dahinter liegt der Eingangsbereich von Aurelion.",

      "gehe links":
        "Links endet der Zaun an einem überwucherten Wartungsweg. Noch ist dort nichts Interessantes.",

      "gehe rechts":
        "Rechts findet ihr nur weitere Betonwand, Dornen und eine beunruhigend neue Überwachungskamera.",

      "hilfe":
        "Gib Befehle ein wie:\n\nuntersuche tor\nuntersuche rohr\nnimm karte\nbenutze karte tor",

      "inventar": () => {
        if (gameState.inventory.length === 0) return "Euer Inventar ist leer.";
        return "Inventar:\n- " + gameState.inventory.join("\n- ");
      }
    }
  }
};

function render() {
  const room = rooms[gameState.room];

  document.getElementById("location").textContent = room.location;
  document.getElementById("story").textContent = room.description;

  renderList("commands", room.commands);
  renderList("hotspots", room.hotspots);
  renderList("inventory", gameState.inventory.length ? gameState.inventory : ["leer"]);
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
function normalizeCommand(command) {

  // Füllwörter entfernen
  const fillerWords = [
    "nach",
    "zum",
    "zur",
    "zu",
    "in",
    "an",
    "auf",
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
  let command = input.trim().toLowerCase();
command = normalizeCommand(command);
  const room = rooms[gameState.room];

  if (!command) return;

  const action = room.actions[command];

  if (!action) {
    showText(
      "Befehl nicht erkannt.\n\nTipp: Nutze Kombinationen wie:\nuntersuche tor\nuntersuche kamera\nuntersuche rohr"
    );
    return;
  }

  if (typeof action === "function") {
    showText(action());
  } else {
    showText(action);
  }

  renderList("inventory", gameState.inventory.length ? gameState.inventory : ["leer"]);
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
