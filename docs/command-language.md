## Command Philosophy

Die Welt von Aurelion basiert auf offener Exploration und parserbasierter Interaktion.

Zu Beginn stehen nur wenige Grundbefehle zur Verfügung. Weitere Interaktionsmuster werden durch Exploration, Storymomente und wiederkehrende Spielsituationen entdeckt und im Terminal freigeschaltet.

Neue Commands sollen sich wie **erlernte Regeln der Welt** anfühlen — nicht wie eine Bedienungsanleitung.

---

## Command Progression

Commands werden in mehreren Stufen eingeführt.

Nicht alle Interaktionsmöglichkeiten sollen früh sichtbar sein. Spieler sollen auch in späteren Kapiteln noch neue Mechaniken entdecken.

### Tier 1 — Core Exploration
*(Tutorial + frühe Kapitel)*

Grundsprache der Welt.

- `umsehen`
- `gehe [richtung/ort]`
- `untersuche [objekt/ort]`
- `nimm [objekt]`
- `benutze [objekt] [ziel]`
- `öffne [objekt]`
- `hint`
- `terminal`

Ziel:
Spieler versteht grundlegende Navigation und Interaktion.

---

### Tier 2 — Investigation
*(frühe bis mittlere Kapitel)*

Neue Formen der Informationsgewinnung.

Mögliche Commands:

- `lies [objekt]`
- `lausche [objekt/person]`
- `rede [person]`
- `warte`

Ziel:
Welt wird informationsreicher und weniger rein objektbasiert.

---

### Tier 3 — Manipulation & Facility Interaction
*(mittlere Kapitel)*

Neue Interaktionslogik mit Maschinen, Industrieumgebung und Infrastruktur.

Mögliche Commands:

- `kombiniere [objekt] [objekt]`
- `verbinde [objekt] [objekt]`
- `ziehe [objekt]`
- `drücke [objekt]`
- `drehe [objekt]`
- `schiebe [objekt]`
- `aktiviere [objekt]`
- `deaktiviere [objekt]`

Wichtig:
Neue Commands nur dann einführen, wenn sie ein neues mentales Modell erzeugen und nicht bereits sinnvoll durch `benutze` abgebildet werden können.

Beispiel:
`benutze hebel` ist meist besser als ein eigener `ziehe`-Command — außer die Manipulation selbst wird zum Gameplay.

---

### Tier 4 — Aurelion Systems
*(spätere Kapitel)*

Spezielle Interaktionen, die die Eigenlogik von Aurelion erweitern.

Mögliche Commands:

- `scan [objekt]`
- `hacke [system]`
- `dekodiere [signal]`
- `kalibriere [objekt]`
- `synchronisiere [system]`
- `überbrücke [system]`

Ziel:
Späte Kapitel sollen neue Denkweisen ermöglichen und sich mechanisch anders anfühlen.

---

## Hidden Commands

Hidden Commands sind Commands, die zunächst als `???` im Terminal erscheinen oder komplett unbekannt bleiben.

Sie werden freigeschaltet durch:

- Exploration
- wiederholte Spielsituationen
- Storymomente
- Versuch-und-Irrtum
- subtile Hinweise

Unlocks sollen möglichst organisch wirken.

Beispiel:

Spieler entdeckt einen Kartenleser → `benutze`

Spieler untersucht ein verschlossenes Fach → `öffne`

Spieler findet inkomplette Bauteile → `kombiniere`

---

## Design-Regeln

### 1. Situation vor Command
Commands sollen logisch aus der Situation ableitbar sein.

Spieler soll denken:

> „Ich würde jetzt gerne X versuchen.“

nicht:

> „Welchen Parser-Verb habe ich noch nicht ausprobiert?“

---

### 2. Wiederverwendbarkeit
Neue Commands sollten mehrfach im Spiel relevant sein.

Keine One-Off-Commands für einzelne Rätsel.

---

### 3. Minimalismus vor Verben-Explosion
Bestehende Commands werden bevorzugt wiederverwendet.

Bevorzugt:

`benutze ventil`

statt:

`drehe ventil`

Außer die spezifische Aktion wird selbst Teil des Rätsels.

---

### 4. Neuer Command = neues mentales Modell
Neue Commands sollen neue Arten des Denkens eröffnen.

Beispiele:

`kombiniere`
→ Inventar-/Crafting-Denken

`scan`
→ neue Informationsebene

`hacke`
→ Systemmanipulation

---

### 5. Späte Discoverability
Nicht alle wichtigen Commands früh einführen.

Auch in späteren Kapiteln sollen neue `???` auftauchen, um Progression zu erzeugen.

---

### 6. Soft Guidance statt Tutorials
Neue Commands werden bevorzugt subtil eingeführt.

Beispiele:

- Umgebungshinweise
- Formulierungen in Beschreibungen
- NPC-Kommentare
- System-Hints

Keine klassischen:
> NEW COMMAND UNLOCKED
