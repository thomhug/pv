// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
// Version 1.0.2

let configfile;
let smid;
let auth;
try {
  configfile = importModule("config");
  auth = configfile.auth;
  smid = configfile.smid;
} catch (e) {
  // Modul nicht gefunden, verwende Standardkonfiguration
  const username = "username";
  const password = "password";
  smid = "SolarManagerID";
  
  // generiere Token
  const usernamePassword = `${username}:${password}`;
  auth = `Basic ${Data.fromString(usernamePassword).toBase64String()}`;
}

const textsize = 15;
const minimumScaleFactor = 0.5;

const req = new Request('https://cloud.solar-manager.ch/v1/consumption/gateway/' + smid + '?period=day');
req.headers = {
  "accept": "application/json",
  "authorization": auth
}
const json = await req.loadJSON();

try {
  data = json['data'][0];
} catch (e) {
  let widget = new ListWidget();
  let text1 = widget.addText("Zugangsdaten oder SolarmanagerID falsch.");
  console.log("Zugangsdaten oder SolarmanagerID falsch.");
  Script.setWidget(widget);
  Script.complete();
  return;
}

const consumptionEnergy = Math.round(data['consumption']/1000);
const productionEnergy = Math.round(data['production']/1000); 

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
const currentPvGeneration = Math.round(json2.currentPvGeneration /1000 * 10) / 10; // Runden auf eine Nachkommastelle
const currentPowerConsumption = Math.round(json2.currentPowerConsumption /1000 * 10) / 10; // Runden auf eine Nachkommastelle

// Erstellen Sie das Widget
let widget = new ListWidget();

let text1 = widget.addText("☀️" + currentPvGeneration + "kW / " + productionEnergy + "kWh")
text1.textColor = Color.orange();
text1.font = Font.systemFont(textsize);
text1.minimumScaleFactor = minimumScaleFactor;
text1.lineLimit = 1;

let text2 = widget.addText("🔌" + currentPowerConsumption + "kW / " + consumptionEnergy + " kWh")
text2.textColor = Color.blue()
text2.font = Font.systemFont(textsize);
text2.minimumScaleFactor = minimumScaleFactor;
text2.lineLimit = 1;

let temptext = widget.addText("🌡" + outdoorTemp + "°C🚿" + warmWaterTemp + "°C");
temptext.font = Font.systemFont(textsize);
temptext.minimumScaleFactor = minimumScaleFactor;
temptext.lineLimit = 1;

let timetext = widget.addText("🔋" + battery + "% ⏱ " + new Date().getHours() + ":" + new Date().getMinutes().toString().padStart(2,"0"));
timetext.font = Font.systemFont(textsize);
timetext.minimumScaleFactor = minimumScaleFactor;
timetext.lineLimit = 1;

if (config.runsInWidget) {
  // Platzieren Sie das Widget auf dem Startbildschirm des iPhones
  Script.setWidget(widget);
} else {
  // Vorschau anzeigen
  widget.presentSmall();
}

Script.complete();
