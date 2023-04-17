// GitHub-URL des Skripts
let scriptURL = "https://github.com/thomhug/pv/raw/main/scriptable/solarmanager.js"

// Anforderung des Skripts über die GitHub-API
let request = new Request(scriptURL)
let script = await request.loadString()

// Speichern des Skripts lokal
let fm = FileManager.local()
let path = fm.joinPath(fm.documentsDirectory(), "Solarmanager.js")
fm.writeString(path, script)

// Ausgabe der erfolgreichen Speicherung
console.log("Das Skript wurde erfolgreich heruntergeladen und lokal gespeichert.")
