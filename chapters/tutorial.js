const tutorial = {
  id: "tutorial",
  title: "Tutorial – Systemeinweisung",

  startRoom: "tutorialRoom",
  startArea: "terminal",

  unknownCommandHint:
  "SYSTEM HINT: Versuche einfache Befehle wie „umsehen“, „untersuche terminal“ oder „gehe vorne“.",

  aliases: {
    terminal: "terminal",
    bildschirm: "terminal",
    anzeige: "terminal",
    vorne: "ausgang",
    weiter: "ausgang"
  },

  rooms: {
    tutorialRoom: {
      location: "AURELION TRAINING SIMULATION",
      objective: "Schließe die grundlegende Systemeinweisung ab.",

      commands: [
        "umsehen",
        "gehe [richtung/ort]",
        "untersuche [objekt]",
        "nimm [objekt]",
        "benutze [objekt] [ziel]"
      ],

      areas: {
        terminal: {
          name: "Trainings-Terminal",
          description:
            "Du stehst in einem sterilen, künstlich ausgeleuchteten Simulationsraum.\n\nVor dir flackert ein Terminal. Auf dem Bildschirm steht: WILLKOMMEN ZUR AURELION SYSTEMEINWEISUNG.\n\nDas System wartet darauf, dass du dich umsiehst.",

          details: [
            "terminal",
            "hinweis",
            "ausgang"
          ],

          exits: {
            vorne: {
              target: "ausgang",
              display: "vorne",
              hiddenLabel: "schwacher Lichtstreifen",
              discoveredLabel: "Ausgang der Simulation"
            }
          }
        },

        ausgang: {
          name: "Simulationsausgang",
          description:
            "Eine Tür ohne Griff steht offen. Dahinter liegt nur Dunkelheit.\n\nDas Tutorial ist hier erstmal nur ein Platzhalter. Später kannst du hier die finalen Grundbefehle, Field Notes und erste Interaktionen erklären.",

          details: [
            "tuer",
            "dunkelheit"
          ],

          exits: {
            zurueck: {
              target: "terminal",
              display: "zurück",
              hiddenLabel: "Trainingsbereich",
              discoveredLabel: "Trainings-Terminal"
            }
          }
        }
      },

      details: {
        terminal: {
          text:
            "Das Terminal reagiert auf einfache Textbefehle.\n\nBekannte Befehle sind zum Beispiel: „umsehen“, „gehe vorne“ oder „untersuche hinweis“."
        },

        hinweis: {
          text:
            "AURELION-HINWEIS:\nNicht alle nützlichen Befehle sind von Anfang an dokumentiert."
        },

        ausgang: {
          text:
            "Der Ausgang führt aus der Trainingssimulation. Für die finale Version könnte hier der Übergang zu Kapitel 1 liegen."
        },

        tuer: {
          text:
            "Die Tür wirkt absichtlich harmlos. Das macht sie nicht vertrauenswürdiger."
        },

        dunkelheit: {
          text:
            "Die Dunkelheit hinter der Simulation scheint nicht simuliert zu sein."
        }
      },

      interactions: {
        examine: {},

        take: {},

        open: {},

        use: {},

        combine: {}
      }
    }
  }
};
