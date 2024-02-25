#!/usr/bin/python3
# @tomdawon - 20.02.2024

# Benötigt aktuelle Version von openDTU v24.2.16 (einfaches Update über WebGUI möglich!)

import requests
import time

dtuip = "10.10.11.66"
serial = "12345"
hwlimit = 800             # Maximales, hardwarebedingtes Limit
target = 600              # gesetzliches Limit
user = "admin"
password = "xxx"

# Abfrage von Daten des Inverters
response = requests.get(f"http://{dtuip}/api/livedata/status?inv={serial}")
data = response.json()

# Überprüfung, ob Daten vom Inverter erhalten wurden
if not data:
    print("No data from inverter received")
    exit()

# Ausgabe der Power-Werte für jeden DC-Anschluss
for inv in data["inverters"]:
    if inv["serial"] == serial:
        dc_data = inv["DC"]
        dc_power_values = {key: value["Power"]["v"] for key, value in dc_data.items()}
        print("DC Power:", dc_power_values)

# Ausgabe von AC-Power, Effizienz und relativer Grenzwert
for inv in data["inverters"]:
    if inv["serial"] == serial:
        ac_data = inv["AC"]["0"]
        ac_power = ac_data["Power"]["v"]
        efficiency = inv["INV"]["0"]["Efficiency"]["v"]
        limit_relative = inv["limit_relative"]
        print("AC Power:", ac_power)
        print("Efficiency:", efficiency)
        print("Relative limit:", limit_relative)
        limit_absolut = limit_relative / 100 * hwlimit
        print("Limit:", limit_absolut)

print("")

# Initialisierung für Kalkulation
ports = len(dc_power_values)
port_limit = target / ports
dc_total = 0
diff_sum = 0
potential = 0

# Kalkulation
for port, dc_power_value in dc_power_values.items():
  dc_total += dc_power_value
  if dc_power_value * efficiency/100 < port_limit:
    diff_sum += port_limit - (dc_power_value * efficiency/100)
  if dc_power_value * efficiency/100 > port_limit * 0.95:
    print("port " + str(port) + " ist über dem Limit: " + str(dc_power_value))
    potential = 1

if dc_total * efficiency/100 < target and potential == 1:
  print("Es gäbe Raum, da " + str(dc_total * efficiency/100) + " kleiner " + str(target))
  print("Vorschlag Erhoehung: " + str(diff_sum*2))   
  target_limit = round(target + diff_sum*2)
  print("Setting to: " + str(target_limit))   
elif ac_power <= target *1.02:
  print("Der WR ist unter dem Limit, keine Aenderung.")
  target_limit = limit_absolut
else:
  print("Der WR ist bereits am Limit oder Erhoehung ist nicht noetig.")
  target_limit = target
  print("Setting to: " + str(target_limit))   


print("")

# Abfrage und Ausgabe von Limitstatus
response = requests.get(f"http://{dtuip}/api/limit/status")
limit_status = response.json()

# Ausgabe des Limits für den WR mit der gegebenen Seriennummer
if serial in limit_status:
    wr_limit = limit_status[serial]["limit_relative"]
    print("Limit für WR {}:".format(serial), wr_limit)
else:
    print("Seriennummer {} nicht gefunden.".format(serial))

# Nur ändern wenn das Limit anders ist wie das aktuelle Setting
if round(wr_limit) != round(100/hwlimit * target_limit):

  # Konfiguration des Grenzwerts
  response = requests.post(f"http://{dtuip}/api/limit/config", data=f'data={{"serial":"{serial}", "limit_type":0, "limit_value":{target_limit}}}', auth=(user, password), headers = {'Content-Type': 'application/x-www-form-urlencoded'})

  # Ueberprüfung der Antwort
  response_text = response.json()
  if response.status_code == 200 and response_text["type"] == "success":
      print("Limit erfolgreich gesetzt für WR {} auf {}.".format(serial, target_limit))
  else:
      print("Fehler beim Setzen des Limits:", response.json())

  print("")

  # Erneute Abfrage und Ausgabe von Limitstatus nach Konfiguration
  response = requests.get(f"http://{dtuip}/api/limit/status")
  limit_status = response.json()

  # Bsp: '1111': {'limit_relative': 75, 'max_power': 800, 'limit_set_status': 'Ok'}

  # Ausgabe des Limits für den WR mit der gegebenen Seriennummer
  if serial in limit_status:
      wr_limit = limit_status[serial]["limit_relative"]
      limit_set_status = limit_status[serial]["limit_set_status"]
      print("Limit für WR {}:".format(serial), wr_limit)
      print("Limit Status für WR {}:".format(serial), limit_set_status)
  else:
      print("Seriennummer {} nicht gefunden.".format(serial))
      print(limit_status)


  # Warten für 5 Sekunden bis der Wert geschrieben ist (währenddessen ist limit_set_status "pending"
  time.sleep(5)
  print("")

  # Abfrage und Ausgabe von Limitstatus
  response = requests.get(f"http://{dtuip}/api/limit/status")
  limit_status = response.json()

  # Ausgabe des Limits für den WR mit der gegebenen Seriennummer
  if serial in limit_status:
      wr_limit = limit_status[serial]["limit_relative"]
      limit_set_status = limit_status[serial]["limit_set_status"]
      print("Limit für WR {}:".format(serial), wr_limit)
      print("Limit Status für WR {}:".format(serial), limit_set_status)
  else:
      print("Seriennummer {} nicht gefunden.".format(serial))
      print(limit_status)

else:
  print("Keine Änderung der Einstellungen noetig")

print("")
print("")
