/*
=================================================
COMMAND STRUCTURE REFERENCE
=================================================

Categories:
- NAVIGATION
- INTERACTION
- INVESTIGATION
- SURVIVAL
- AURELION
- SYSTEM

Discovery:
- visibleByDefault: true
  -> sofort sichtbar

- visibleByDefault: false
  -> erscheint erst nach discoverCommand()

Progression:
- Commands können durch:
  - Exploration
  - Storymomente
  - Items
  - Versuch-und-Irrtum
  freigeschaltet werden.

=================================================
EXAMPLES
=================================================
*/

/*
-------------------------------------------------
CORE COMMAND
-------------------------------------------------
*/

gehe: {
  id: "gehe",

  label: "gehe",
  syntax: "gehe [richtung/ort]",

  category: "NAVIGATION",
  order: 20,

  visibleByDefault: true,

  description:
    "Bewegt dich zwischen Orten.",

  examples: [
    "gehe vorne",
    "gehe links"
  ],

  blockedWhen: () =>
    hasFlag("movementLocked"),

  blockedText:
    "SYSTEM HINT: Bewegung aktuell eingeschränkt.",

  requiredItems: [],

  aliases: [
    "lauf",
    "renne"
  ],

  tags: [
    "movement"
  ]
},

/*
-------------------------------------------------
HIDDEN COMMAND
-------------------------------------------------
*/

oeffne: {
  id: "oeffne",

  label: "öffne",
  syntax: "öffne [objekt]",

  category: "INTERACTION",
  order: 40,

  visibleByDefault: false,
  discoveredFlag:
    "command_oeffne_discovered",

  description:
    "Öffnet Türen, Behälter oder Mechanismen.",

  examples: [
    "öffne tür",
    "öffne schrank"
  ],

  blockedWhen: () =>
    hasFlag("handsBlocked"),

  blockedText:
    "SYSTEM HINT: Öffnen aktuell nicht möglich.",

  requiredItems: []
},

/*
-------------------------------------------------
ITEM-DEPENDENT COMMAND
-------------------------------------------------
*/

scan: {
  id: "scan",

  label: "scan",
  syntax: "scan [objekt]",

  category: "AURELION",
  order: 10,

  visibleByDefault: false,
  discoveredFlag:
    "command_scan_discovered",

  description:
    "Analysiert Objekte auf versteckte Informationen.",

  examples: [
    "scan terminal",
    "scan roboter"
  ],

  requiredItems: [
    "scanner"
  ],

  blockedWhen: () =>
    hasFlag("scannerBroken"),

  blockedText:
    "SYSTEM HINT: Scanner aktuell nicht verfügbar."
},

/*
=================================================
FULL TEMPLATE
=================================================
*/

const COMMAND_TEMPLATE = {
  id: "command_id",

  label: "anzeigename",
  syntax: "command [objekt]",

  category: "INTERACTION",

  order: 10,

  visibleByDefault: false,
  discoveredFlag:
    "command_discovered_flag",

  description:
    "Beschreibung des Commands.",

  examples: [],

  requiredItems: [],

  blockedWhen: null,

  blockedText:
    "SYSTEM HINT: Command aktuell gesperrt.",

  aliases: [],

  tags: []
};
