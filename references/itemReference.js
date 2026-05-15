/*
=================================================
ITEM STRUCTURE REFERENCE
=================================================

Available Categories:
- key
- tool
- consumable
- part
- clue
- environment
- story

Inventory Modes:
- inventory
- observation
- local

=================================================
ITEM TEMPLATE
=================================================
*/

const ITEM_SCHEMA_REFERENCE = {
  id: "item_id",

  name: "Anzeigename",
  aliases: [],

  category: "key",

  inventoryMode: "inventory",

  description: "Kurze Beschreibung.",
  examineText: "Text bei untersuche item.",

  canTake: true,
  canUse: true,
  canExamine: true,
  canCombine: false,

  stackable: false,
  quantity: 1,
  maxStack: 1,

  consumable: false,
  consumeOnUse: false,

  unlocksCommands: [],

  flagsOnTake: [],
  flagsOnUse: [],
  flagsOnExamine: [],

  observationsOnTake: [],
  observationsOnUse: [],
  observationsOnExamine: [],

  removeFromAreaOnTake: true,
  removeFromInventoryOnUse: false,

  hidden: false,
  visibleWhen: null,
  usableWhen: null,

  useText: "Du benutzt das Item.",
  failText: "Das scheint hier nichts zu bewirken.",

  combineWith: {},

  tags: []
};


/*
=================================================
EXAMPLES
=================================================

TOOL ITEM
-------------------------------------------------

scanner: {
  id: "scanner",

  name: "Portable Scanner",

  category: "tool",
  inventoryMode: "inventory",

  canTake: true,
  canUse: true,
  canExamine: true,

  unlocksCommands: ["scan"]
}

-------------------------------------------------

OBSERVATION ITEM
-------------------------------------------------

family_photo: {
  id: "family_photo",

  name: "Familienfoto",

  category: "clue",
  inventoryMode: "observation",

  canTake: false,
  canExamine: true,

  examineText:
    "Ein altes Foto vor einem Aurelion-Gebäude."
}

-------------------------------------------------

STACKABLE ITEM
-------------------------------------------------

battery: {
  id: "battery",

  name: "Batterie",

  category: "consumable",
  inventoryMode: "inventory",

  stackable: true,
  quantity: 1,
  maxStack: 10,

  consumable: true
}
*/
