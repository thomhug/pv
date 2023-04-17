// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
// Version 1.0.0
const config = importModule("config");
const auth = config.auth;
const smid = config.smid;

const req = new Request('https://cloud.solar-manager.ch/v1/consumption/gateway/' + smid + '?period=day');
req.headers = {
  "accept": "application/json",
  "authorization": auth
}
const json = await req.loadJSON();
const data = json['data'][0];
const consumptionEnergy = data['consumption']/1000;
const productionEnergy = data['production']/1000;

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
