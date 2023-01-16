# Tom's PV Dashboard
Scripts und Configs um ein PV Dashboard wie dieses zu machen:
![Dashboard](https://github.com/thomhug/pv/blob/main/pv%20dashboard%202023-01-13.PNG)

Grobe Funktionsweise:

- Auf einem RaspberryPi im LAN/Wifi mit einem Fronius Wechselrichter, Shelly 3EM's, myStrom Steckdosen und anderen Geräten läuft ein json_exporter (https://github.com/prometheus-community/json_exporter). Die Config vom json_exporter beschreibt, was wo ist in den jeweiligen APIs von den Geräten.
- Mittels einem SSH Tunnel expose ich den Port vom json_exporter (default 7979) auf einem Jumphost (normaler Cloudserver)
- Auf meinem Prometheus/Grafana Server läuft ebenfalls ein SSH Tunnel auf den Jumphost um den Port lokal abrufbar machen zu können (so braucht weder jemand von aussen Zugriff auf den RaspberryPi via SSH, noch braucht der Raspi Zugriff auf den Prometheus/Grafana Server
- Ein Prometheus holt die Metriken durch die Tunnels vom json_exporter ab und speichert sie lokal in seiner TimeSeriesDB
- Grafana stellt alles dar via Prometheus Datasource
- Um den Sonnenstand darzustellen verwende ich das Sun and Moon Plugin für Grafana (https://grafana.com/grafana/plugins/fetzerch-sunandmoon-datasource/)

Hinweise

- Es gibt historisch bedingt verschiedene Metriken, welche identisch sind, z.B. (alt) shelly_wh_counter und neu meter{type="counter"}, dito mit gauge. Das liegt daran, dass ich erst später verstanden habe, wie Labels funktionieren :) Es ist noch nicht alles aufgeräumt - sorry :)
- Ich verwende Variablen im Dashboard, aber noch nicht konsequent - sorry für die Verwirrung

Konzept Metriken- & Labelnamen

- In/Out aus Sicht Haus: 
  - Grid in = Bezug (>0), grid out = Einspeisung (<0)
  - PV in = Produktion (>0)
  - Batt in = Laden (>0)
   
```
    sensor:
      location: <standort, z.b. cham>
      type: <temp, hum, percent, status>
      position: <wohnzimmer, boiler, outdoor>
      kind: <indoor, outdoor, boiler, battery, heizung>   <- optional
    meter:
      location: <standort, z.b. cham>
      position: <generator, grid, battery, device, genstring> # wenn wp zähler  spe, dann grid
      type: <counter, gauge>
      direction: <in, out>   <- nur für counter, gauge wird negativ
                  in = bezug, out = einspeisung
      description: <optional ... waermepumpe>
    tarif:
      location: <standort, z.b. cham>
      type: <bezug, einspeisung>
```

Nächste Schritte

- Solarprognose von https://twitter.com/_solarmanager speichern und als ist-soll Vergleich visualisieren.
- Langzeitspeicher 'Problem' lösen, indem Tagessummen in einer SQL DB gespeichert werden (gibt es bessere Ideen?)

Fragen & Feedback: https://twitter.com/tomdawon
