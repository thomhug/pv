// Konfigurationsvariablen
module.exports = {
  auth: "Basic xxx",
  smid: "xxx"
}

// Ausgabe der erfolgreichen Speicherung
let widget = new ListWidget();

widget.addText("In diesem Script befinden sich die Credentials für deinen SolarManager sowie deine Solarmanager ID.");

if (config.runsInWidget) {
  // Platzieren Sie das Widget auf dem Startbildschirm des iPhones
  Script.setWidget(widget);
} else {
  // Vorschau anzeigen
  widget.presentSmall();
}
