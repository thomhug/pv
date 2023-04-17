// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
// Version 1.0

const config = importModule("config")
const auth = config.auth
const smid = config.smid

const currentDate = new Date();
const midnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
const from = encodeURIComponent(midnight.toISOString());
const to = encodeURIComponent(currentDate.toISOString());

const url = "https://cloud.solar-manager.ch/v1/consumption/gateway/" + smid + "/range?from=" + from + "&to=" + to + "&interval=300000";
const req = new Request(url);
req.headers = {
  "accept": "application/json",
  "authorization": auth
}
const json = await req.loadJSON();

// Berechnen Sie die Energie für Verbrauch und Ertrag seit Mitternacht
let consumptionEnergy = 0;
let productionEnergy = 0;
for (let i = 0; i < json.data.length; i++) {
  let timeDiff = 0;
  if (i === 0) {
    timeDiff = Math.round((new Date(json.from).getTime() - midnight.getTime()) / 1000);
  } else {
    timeDiff = Math.round((new Date(json.data[i].date).getTime() - new Date(json.data[i - 1].date).getTime()) / 1000);
  }
  const consumption = json.data[i].cW;
  const production = json.data[i].pW;
  consumptionEnergy += (consumption / 1000) * (timeDiff / 3600);
  productionEnergy += (production / 1000) * (timeDiff / 3600);
}
consumptionEnergy = Math.round(consumptionEnergy * 10) / 10; // Runden auf eine Nachkommastelle
productionEnergy = Math.round(productionEnergy * 10) / 10; // Runden auf eine Nachkommastelle

const url2 = "https://cloud.solar-manager.ch/v1/chart/gateway/" + smid;
const req2 = new Request(url2);
req2.headers = {
  "accept": "application/json",
  "authorization": auth
}
const json2 = await req2.loadJSON();
const battery = json2.battery.capacity;

// Erstellen Sie das Widget
let widget = new ListWidget();

widget.addText("Ertrag heute: " + productionEnergy + " kWh");
widget.addText("Verbrauch: " + consumptionEnergy + " kWh");
widget.addText("Batterie: " + battery + "%");
widget.addText("Zeit: " + new Date().getHours() + ":" + new Date().getMinutes().toString().padStart(2,"0"));

if (config.runsInWidget) {
  // Platzieren Sie das Widget auf dem Startbildschirm des iPhones
  Script.setWidget(widget);
} else {
  // Vorschau anzeigen
  widget.presentSmall();
}

Script.complete();
