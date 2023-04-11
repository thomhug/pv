// DS18B20 Webserver for ESP32 - 26.03.2023
// adapted from https://randomnerdtutorials.com/esp32-ds18b20-temperature-arduino-ide/

// Import required libraries
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// GPIO where the DS18B20 is connected to
const int oneWireBus = 17;     

// Setup a oneWire instance to communicate with any OneWire devices
OneWire oneWire(oneWireBus);

// Pass our oneWire reference to Dallas Temperature sensor 
DallasTemperature sensors(&oneWire);

// We'll use this variable to store a found device address
DeviceAddress tempDeviceAddress;

// Number of temperature devices found
int numberOfDevices;

// Variables to store temperature values
String temperatureC = "";
String json = "";

// Timer variables
unsigned long lastTime = 0;  
unsigned long timerDelay = 5000;

// Wifi credentials
const char* ssid = "nine.ch-0815";
const char* password = "ladymacbeth13";

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

String readDSTemperatureC() {
  // Call sensors.requestTemperatures() to issue a global temperature and Requests to all devices on the bus
  sensors.requestTemperatures(); 
  
  float tempC = 0;
  for(int i=0;i<numberOfDevices; i++) {
    // Search the wire for address
    if(sensors.getAddress(tempDeviceAddress, i)) {
      Serial.print("Found device ");
      Serial.print(i, DEC);
      Serial.print(" with address: ");
      printAddress(tempDeviceAddress);
      tempC = sensors.getTempCByIndex(i);
      if(tempC == -127.00) {
        Serial.println("Failed to read from DS18B20 sensor");
        return "--";
      } else {
        Serial.print(" Temp: ");
        Serial.println(tempC);
      }
    } else {
      Serial.print("Found ghost device at ");
      Serial.print(i, DEC);
      Serial.print(" but could not detect address. Check power and cabling");
    }
  }
  Serial.println("-----------------");
  return String(tempC);
}

String readDSTemperatureJSON() {
  // Call sensors.requestTemperatures() to issue a global temperature and Requests to all devices on the bus
  Serial.println("Reading sensors for json ...");
  sensors.requestTemperatures(); 
  
  String output = "{\n";
  for(int i=0;i<numberOfDevices; i++) {
    // Search the wire for address
    if(sensors.getAddress(tempDeviceAddress, i)) {
      char addr_str[24];
      snprintf(addr_str, sizeof(addr_str), "%02X:%02X:%02X:%02X:%02X:%02X:%02X:%02X",
        tempDeviceAddress[0], tempDeviceAddress[1], tempDeviceAddress[2], tempDeviceAddress[3],
        tempDeviceAddress[4], tempDeviceAddress[5], tempDeviceAddress[6], tempDeviceAddress[7]);
      float tempC = sensors.getTempCByIndex(i);
      if(tempC == -127.00) {
        Serial.println("Failed to read from DS18B20 sensor");
        return "{\”error\”: \"Failed to read from DS18B20 sensor" + String(i) + " \"}\n";
      } else {
        if ((i > 0) && (i < numberOfDevices)) output += ",\n";
        output += "\"" + String(addr_str) + "\": " + String(tempC);
        if (i == numberOfDevices -1) output += "\n";
      }
    } else {
      Serial.print("Found ghost device at ");
      Serial.print(i, DEC);
      Serial.print(" but could not detect address. Check power and cabling");
    }
  }
  output += "}\n";
  Serial.println("-----------------");
  return output;
}

// function to print a device address
void printAddress(DeviceAddress deviceAddress) {
  for (uint8_t i = 0; i < 8; i++){
    if (deviceAddress[i] < 16) Serial.print("0");
      Serial.print(deviceAddress[i], HEX);
      if (i>7) { 
        Serial.print(":");
      }
  }
}

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE HTML><html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
  <style>
    html {
     font-family: Arial;
     display: inline-block;
     margin: 0px auto;
     text-align: center;
    }
    h2 { font-size: 3.0rem; }
    p { font-size: 3.0rem; }
    .units { font-size: 1.2rem; }
    .ds-labels{
      font-size: 1.5rem;
      vertical-align:middle;
      padding-bottom: 15px;
    }
  </style>
</head>
<body>
  <h2>ESP DS18B20 Server</h2>
  <p>
    <i class="fas fa-thermometer-half" style="color:#059e8a;"></i> 
    <span class="ds-labels">Temperature Celsius</span> 
    <span id="temperaturec">%TEMPERATUREC%</span>
    <sup class="units">&deg;C</sup>
  </p>
</body>
<script>
setInterval(function ( ) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("temperaturec").innerHTML = this.responseText;
    }
  };
  xhttp.open("GET", "/temp", true);
  xhttp.send();
}, 10000) ;
</script>
</html>)rawliteral";

// Replaces placeholder with DS18B20 values
String processor(const String& var){
  //Serial.println(var);
  if(var == "TEMPERATUREC"){
    return temperatureC;
  }
  return String();
}

void setup(){
  // Serial port for debugging purposes
  Serial.begin(115200);
  Serial.println();
  
  // Start up the DS18B20 library
  sensors.begin();

  // Grab a count of devices on the wire
  numberOfDevices = sensors.getDeviceCount();

  // locate devices on the bus
  Serial.print("Locating devices...");
  Serial.print("Found ");
  Serial.print(numberOfDevices, DEC);
  Serial.println(" devices.");

  // Loop through each device, print out address
  for(int i=0;i<numberOfDevices; i++){
    // Search the wire for address
    if(sensors.getAddress(tempDeviceAddress, i)){
      Serial.print("Found device ");
      Serial.print(i, DEC);
      Serial.print(" with address: ");
      printAddress(tempDeviceAddress);
      Serial.println();
    } else {
      Serial.print("Found ghost device at ");
      Serial.print(i, DEC);
      Serial.print(" but could not detect address. Check power and cabling");
    }
  }

  temperatureC = readDSTemperatureC();
  if(sensors.getAddress(tempDeviceAddress, 0)){
    printAddress(tempDeviceAddress);
    Serial.println();
  }
  json = readDSTemperatureJSON();

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  
  // Print ESP Local IP Address
  Serial.println(WiFi.localIP());

  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html, processor);
  });
  server.on("/temp", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/plain", temperatureC.c_str());
  });
  server.on("/json", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "application/json", json);
  });
  // Start server
  server.begin();
}
 
void loop(){
  if ((millis() - lastTime) > timerDelay) {
    temperatureC = readDSTemperatureC();
    json = readDSTemperatureJSON();
    lastTime = millis();
  }  
}

