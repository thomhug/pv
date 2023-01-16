# Tom's PV Dashboard
Scripts und Configs um ein PV Dashboard zu machen

Grobe Funktionsweise:

- Auf einem RaspberryPi im LAN/Wifi mit einem Fronius Wechselrichter, Shelly 3EM's, myStrom Steckdosen und anderen Geräten läuft ein json_exporter (https://github.com/prometheus-community/json_exporter). Die Config vom json_exporter beschreibt, was wo ist in den jeweiligen APIs von den Geräten.
- Mittles einem SSH Tunnel expose ich den Port vom json_exporter auf einem Jumphost (normaler Cloudserver)
- Auf meinem Prometheus/Grafana Server läuft ebenfalls ein SSH Tunnel auf den Jumphost um den Port lokal abrufbar machen zu können (so braucht weder jemand von aussen Zugriff auf den RaspberryPi via SSH, noch braucht der Raspi Zugriff auf Prometheus/Grafana
- Ein Prometheus holt die Metriken durch die Tunnels vom json_exporter ab
- Grafana stellt alles dar

Hinweise

- Es gibt historisch bedingt verschiedene Metriken, welche identisch sind, z.B. (alt) shelly_wh_counter und neu meter{type="counter"}, dito mit gauge. Das liegt daran, dass ich erst später verstanden habe, wie Labels funktionieren :) Es ist noch nicht alles aufgeräumt - sorry :)
- Ich verwende Variablen im Dashboard, aber noch nicht konsequent - sorry für die Verwirrung


Fragen & Feedback: https://twitter.com/tomdawon
