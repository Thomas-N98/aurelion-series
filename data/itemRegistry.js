const itemRegistry = {
  scanner: {
    id: "scanner",
    name: "Scanner",
    category: "tool",
    inventoryMode: "inventory",
    stackable: false,
    maxStack: 1,
    consumable: false,
    description: "Ein tragbares Analysegerät von Aurelion.",
    examineText: "Der Scanner wirkt robust, aber nicht besonders vertrauenerweckend.",
    unlocksCommands: ["scan"],
    aliases: ["analysegeraet", "diagnosegeraet"],
    tags: ["aurelion", "tool"]
  },

  battery: {
    id: "battery",
    name: "Batterie",
    category: "consumable",
    inventoryMode: "inventory",
    stackable: true,
    maxStack: 10,
    consumable: true,
    description: "Eine einfache Batterie.",
    examineText: "Noch genug Ladung für einfache Geräte.",
    unlocksCommands: [],
    aliases: ["batterie", "energiezelle"],
    tags: ["power", "consumable"]
  },

  zugangskarte: {
    id: "zugangskarte",
    name: "Zugangskarte",
    category: "key",
    inventoryMode: "inventory",
    stackable: false,
    maxStack: 1,
    consumable: false,
    description: "Eine Aurelion-Zugangskarte.",
    examineText: "Die Karte ist zerkratzt. Das Logo ist kaum noch zu erkennen.",
    unlocksCommands: [],
    aliases: ["karte", "zugangskarte", "ausweis"],
    tags: ["access", "security"]
  },

  taschenlampe: {
    id: "taschenlampe",
    name: "Taschenlampe",
    category: "tool",
    inventoryMode: "inventory",
    stackable: false,
    maxStack: 1,
    consumable: false,
    description: "Eine kleine Taschenlampe aus deinem Auto.",
    examineText: "Nicht besonders hell, aber besser als gar nichts.",
    unlocksCommands: [],
    aliases: ["lampe", "flashlight"],
    tags: ["light", "tool"]
  }
};
