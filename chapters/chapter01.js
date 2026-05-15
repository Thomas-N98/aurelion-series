const chapter01 = {
  id: "chapter01",
  startRoom: "outside",
  startArea: "parkplatz",
  
aliases: {
  tor: "haupttor",
  rohr: "wartungsrohr",
  karte: "zugangskarte",
  auto: "auto",
  wegweiser: "wegweiser"
},

  rooms: {
  outside: {
    location: "AURELION INDUSTRIES // PERIMETER ZONE",
    objective: "Gain facility access",

    commands: [
      "umsehen",
      "gehe",
      "untersuche",
      "benutze",
      "nimm",
    ],

    areas: {
  parkplatz: {
    name: "Wanderparkplatz",
    description:
      "Du stehst auf einem abgelegenen Wanderparkplatz. Dein Auto steht neben dir, dahinter die lange, schlängelnde Straße, die dich tief in den Wald geführt hat.\n\nMehrere Wege führen von hier aus zwischen den Bäumen hindurch. Vermutlich führt einer davon zum alten Firmengelände, aber noch siehst du nichts außer Wald, Schotter und verblasste Markierungen.\n\nAn einem der Wege steht ein alter Wegweiser.\n\nEs ist still. Fast ein bisschen zu still.",
    exits: {
      hinten: {
        target: "waldweg_hinten",
        hiddenLabel: "Waldpfad",
        discoveredLabel: "steiler Waldpfad",
        display: "hinter dir"
      },
      links: {
        target: "waldweg_links",
        hiddenLabel: "Waldpfad",
        discoveredLabel: "blockierter Pfad",
        display: "links"
      },
      vorne: {
        target: "waldweg_vorne",
        hiddenLabel: "Waldpfad",
        discoveredLabel: "verwachsener Waldweg",
        display: "vor dir"
      },
      strasse: {
        target: "straße",
        hiddenLabel: "Landstraße",
        discoveredLabel: "Landstraße",
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
        hiddenLabel: "Wanderparkplatz",
        discoveredLabel: "Wanderparkplatz",
        display: "zurück"
      },
      weiter: {
        target: "waldweg_hinten2",
        hiddenLabel: "Waldpfad",
        discoveredLabel: "noch steilerer Waldpfad",
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
        hiddenLabel: "Wanderparkplatz",
        discoveredLabel: "Wanderparkplatz",
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
        hiddenLabel: "Wanderparkplatz",
        discoveredLabel: "Wanderparkplatz",
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
        hiddenLabel: "Wanderparkplatz",
        discoveredLabel: "Wanderparkplatz",
        display: "zurück"
      },
      links: {
        target: "zaunbereich_links",
        hiddenLabel: "Zaunverlauf nach links",
        discoveredLabel: "Zaunverlauf nach links",
        display: "links"
      },
      rechts: {
        target: "zaunbereich_rechts",
        hiddenLabel: "Zaunverlauf nach rechts",
        discoveredLabel: "Zaunverlauf nach rechts",
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
        hiddenLabel: "Wanderparkplatz",
        discoveredLabel: "Wanderparkplatz",
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
        hiddenLabel: "verwachsener Waldweg",
        discoveredLabel: "verwachsener Waldweg",
        display: "zurück"
      },
      rechts: {
        target: "zaunbereich_rechts",
        hiddenLabel: "Zaunverlauf nach rechts",
        discoveredLabel: "Zaunverlauf nach rechts",
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
        hiddenLabel: "verwachsener Waldweg",
        discoveredLabel: "verwachsener Waldweg",
        display: "zurück"
      },
      links: {
        target: "zaunbereich_links",
        hiddenLabel: "Zaunverlauf nach links",
        discoveredLabel: "Zaunverlauf nach links",
        display: "links"
      },
      weiter: {
        target: "haupttor",
        hiddenLabel: "Zaunverlauf nach rechts",
        discoveredLabel: "Haupttor",
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
        hiddenLabel: "Zaunverlauf nach links",
        discoveredLabel: "Zaunverlauf nach links",
        display: "zurück"
      },
      links: {
        target: "wartungsrohr",
        hiddenLabel: "Gebäudeseite",
        discoveredLabel: "Gebäudeseite",
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
        hiddenLabel: "Haupttor",
        discoveredLabel: "Haupttor",
        display: "zurück"
      }
    },
    details: ["zugangskarte"]
  }
},

details: {
auto: {
  text:
    "Dein Auto steht verlassen auf dem Parkplatz. Es wirkt plötzlich deutlich weniger beruhigend als noch vor ein paar Minuten."
},

wegweiser: {
  text:
    "Der Wegweiser ist alt und teilweise überwachsen. Die Richtungsschilder sind kaum noch lesbar.\n\nEin Pfeil zeigt nach vorne. Darunter steht verblasst: INDUSTRIEGELÄNDE."
},

kamera: {
  text:
    "Die Kamera folgt deinen Bewegungen. Ein kleines rotes Licht blinkt im Takt."
},

kartenleser: {
  text:
    "Der Kartenleser ist alt, aber noch aktiv. Ein schwaches grünes Licht pulsiert unter der zerkratzten Oberfläche."
},

schloss: {
  text:
    "Das Schloss wirkt mechanisch, aber es scheint zusätzlich elektronisch blockiert zu sein."
},

zaun: {
  text:
    "Der Zaun ist beschädigt, aber nicht völlig offen. Jemand hat ihn notdürftig zurückgebogen."
},

warnschild: {
  text:
    "Auf dem Warnschild steht:\n\nBETRETEN VERBOTEN\nSICHERHEITSSYSTEM AKTIV"
},

bank: {
  text:
    "Die Bank ist feucht, morsch und mit Moos überwachsen. Jemand hat etwas in das Holz geritzt: KEIN SIGNAL."
},

firmengelände: {
  text:
    "Zwischen den Baumwipfeln erkennst du das verfallene Firmengelände. Selbst aus der Entfernung wirkt es zu groß für etwas, das angeblich aufgegeben wurde."
},

baumstämme: {
  text:
    "Die Baumstämme liegen kreuz und quer über dem Weg. Einige sehen frisch gebrochen aus."
},
  zugangskarte: {
  text: "Die Zugangskarte liegt halb verdeckt im Schmutz. Vielleicht funktioniert sie noch.",
  itemId: "zugangskarte",
  takeable: true,
  takeText: "Du hebst die schmutzige Zugangskarte auf.",
  hideWhenInInventory: "zugangskarte"
}
},
interactions: {
  examine: {
    wegweiser() {
      addObservation(
        "Der Wegweiser erwähnt ein altes INDUSTRIEGELÄNDE."
      );
    },

    kamera() {
      setFlag("cameraExamined");
    }
  },

  open: {
    auto() {
      discoverVerb("oeffne");

      if (hasFlag("autoOpened")) {
        showText("Du hast das Auto bereits durchsucht.");
        return;
      }

      setFlag("autoOpened");
      addItem("taschenlampe");

      showText(
        "Du öffnest die Autotür.\n\nIm Innenraum riecht es nach kaltem Kaffee und feuchter Kleidung. Im Seitenfach findest du eine kleine Taschenlampe.\n\nNeue Interaktion entdeckt: ÖFFNE"
      );

      updateInventory();
    }
  },

  take: {},
  
  use: {
    zugangskarte: {
      kartenleser() {
        if (gameState.area !== "haupttor") {
          showText("Hier gibt es keinen Kartenleser.");
          return;
        }

        if (!hasItem("zugangskarte")) {
          showText("Du hast keine Zugangskarte.");
          return;
        }

        setFlag("gateUnlocked");

        showText(
          "Der Kartenleser piept.\n\nZUGRIFF GEWÄHRT.\n\nDas Haupttor öffnet sich einen Spalt breit. Dahinter liegt der Eingangsbereich von Aurelion."
        );
      },

      haupttor() {
        showText("Vielleicht solltest du die Zugangskarte direkt am Kartenleser benutzen.");
      }
    }
  },
  combine: {
}
}
}
}
};
