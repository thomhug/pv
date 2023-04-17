// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
// Version 1.0.1
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
const consumptionEnergy = Math.round(data['consumption']/1000 * 10) / 10; // Runden auf eine Nachkommastelle
const productionEnergy = Math.round(data['production']/1000 * 10) / 10; // Runden auf eine Nachkommastelle

const url2 = "https://cloud.solar-manager.ch/v1/stream/gateway/" + smid;
const req2 = new Request(url2);
req2.headers = {
  "accept": "application/json",
  "authorization": auth
}
const json2 = await req2.loadJSON();
const warmWaterTemp = json2.devices.find(device => device.warmWaterTemp !== undefined)?.warmWaterTemp;
const outdoorTemp = json2.devices.find(device => device.tempOutside !== undefined)?.tempOutside;
const battery = json2.soc;
const pv = Math.round(json2.currentPvGeneration /1000 * 10) / 10; // Runden auf eine Nachkommastelle

// Erstellen Sie das Widget
let widget = new ListWidget();

let stack1 = widget.addStack()
let text11 = stack1.addText("Ertrag: ")
text11.textColor = Color.black()
let text12 = stack1.addText(productionEnergy + " kWh")
text12.textColor = Color.green()

let stack2 = widget.addStack()
let text21 = stack2.addText("Verbr: ")
text21.textColor = Color.black()
let text22 = stack2.addText(consumptionEnergy + " kWh")
text22.textColor = Color.red()

let stack3 = widget.addStack()
let text31 = stack3.addText("PV: ")
text31.textColor = Color.black()
let text32 = stack3.addText(pv + " kW")
text32.textColor = Color.orange()

widget.addText("Batt: " + battery + "%");
widget.addText("T: " + outdoorTemp + "°C WW: " + warmWaterTemp + "°C");
widget.addText("Zeit: " + new Date().getHours() + ":" + new Date().getMinutes().toString().padStart(2,"0"));

if (config.runsInWidget) {
  // Platzieren Sie das Widget auf dem Startbildschirm des iPhones
  Script.setWidget(widget);
} else {
  // Vorschau anzeigen
  widget.presentSmall();
}

Script.complete();
