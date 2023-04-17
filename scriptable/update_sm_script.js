// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

// GitHub-URL des Skripts
let scriptURL = "https://github.com/thomhug/pv/raw/main/scriptable/solarmanager.js"

// Anforderung des Skripts über die GitHub-API
let request = new Request(scriptURL)
let script = await request.loadString()

// Speichern des Skripts in den Ordner für Scriptable-Skripte
let fm = FileManager.iCloud()
let path = fm.joinPath(fm.documentsDirectory(), "")
if (!fm.isDirectory(path)) {
  fm.createDirectory(path)
}
path = fm.joinPath(path, "Solarmanager.js")
fm.writeString(path, script)

// Ausgabe der erfolgreichen Speicherung
let widget = new ListWidget();

widget.addText("Das Skript wurde erfolgreich heruntergeladen und gespeichert.");

if (config.runsInWidget) {
  // Platzieren Sie das Widget auf dem Startbildschirm des iPhones
  Script.setWidget(widget);
} else {
  // Vorschau anzeigen
  widget.presentSmall();
}

console.log("Das Skript wurde erfolgreich heruntergeladen und lokal gespeichert.")
