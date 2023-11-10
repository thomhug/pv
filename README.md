# Tom's PV Dashboard
Scripts und Configs um ein PV Dashboard wie dieses zu machen:
Dashboard Januar 2023:
![Dashboard Januar 2023](https://github.com/thomhug/pv/blob/main/pv%20dashboard%202023-01-13.PNG)
Neue Version mit Batterieanzeige (Februar 2023):
![Dashboard Februar 2023](https://github.com/thomhug/pv/blob/main/pv%20dashboard%202023-02-21.jpg)
Version November 2023 - aufgeräumter:
![Dashboard November 2023](https://github.com/thomhug/pv/blob/main/pv%20dashboard%202023-11-08.png)

Mehr Dashboards in folgendem Twitter Thread von mir: https://twitter.com/tomdawon/status/1643496217370918914

Grobe Funktionsweise:

- Auf einem RaspberryPi im LAN/Wifi mit einem Fronius Wechselrichter, Shelly 3EM's, myStrom Steckdosen und anderen Geräten läuft ein json_exporter (https://github.com/prometheus-community/json_exporter). Die Config vom json_exporter beschreibt, was wo ist in den jeweiligen APIs von den Geräten.
- Mittels einem SSH Tunnel expose ich den Port vom json_exporter (default 7979) auf einem Jumphost (normaler Cloudserver)
- Auf meinem Prometheus/Grafana Server läuft ebenfalls ein SSH Tunnel auf den Jumphost um den Port lokal abrufbar machen zu können (so braucht weder jemand von aussen Zugriff auf den RaspberryPi via SSH, noch braucht der Raspi Zugriff auf den Prometheus/Grafana Server
- Ein Prometheus holt die Metriken durch die Tunnels vom json_exporter ab und speichert sie lokal in seiner TimeSeriesDB
- Grafana stellt alles dar via Prometheus Datasource
- Um den Sonnenstand darzustellen verwende ich das Sun and Moon Plugin für Grafana (https://grafana.com/grafana/plugins/fetzerch-sunandmoon-datasource/)

Konzept Metriken- & Labelnamen

- In/Out aus Sicht Haus: 
  - Grid in = Bezug (>0), grid out = Einspeisung (<0)
  - PV in = Produktion (>0) 
  - Batt in = Laden (>0)
   
```
    sensor:
      location: <standort>
      type: <temp, hum, percent, status>
      position: <wohnzimmer, boiler, outdoor>
      kind: <indoor, outdoor, boiler, battery, heizung>   <- optional
    meter:
      location: <standort>
      position: <generator, grid, battery, device, genstring> 
      type: <counter, gauge>
      direction: <in, out>   <- nur für counter, gauge wird negativ, bei PV leer
      description: <optional ... z.B. Wärmepumpe, WR Name>
    tarif:
      location: <standort>
      type: <bezug, einspeisung>
```

Nächste Schritte

- Solarprognose von https://twitter.com/_solarmanager speichern und als ist-soll Vergleich visualisieren.
- Langzeitspeicher 'Problem' lösen, indem Tagessummen in einer SQL DB gespeichert werden (gibt es bessere Ideen?)

Fragen & Feedback: https://twitter.com/tomdawon
