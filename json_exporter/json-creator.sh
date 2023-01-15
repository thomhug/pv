#!/bin/bash
# tom@nine.ch - 17.11.2022
#
# Dieses Skript erstellt aus Files mit Value als Inhalt ein json-File. Siehe Beispiel. 
# So kann man z.B. der Tarif oder andere, nicht direkt aus Wechselrichter oder anderen APIs
# auslesbare Daten (z.B. Batteriebetriebene Geraete, welche ihren Status pushen) mit dem 
# json_exporter exportieren. 

dir=/run/user/1001
date=$(date --iso-8601=seconds)

if [ ! -d $dir/json/ ]; then
  echo dir does not exist.
  exit
fi

chmod 777 $dir
chmod 777 $dir/json
cd $dir/json/

if [ ! -f wohnzimmertemp ]; then
  touch wohnzimmertemp
  chmod 777 wohnzimmertemp
fi

echo $date > timestamp

vars="$(for i in *; do if [ ! -s $i ]; then continue ; fi ; echo -n "--arg $i " ; var=`cat $i` ; echo -n "$var " ; done)" 

jq -n $vars '$ARGS.named' > $dir/build.json.new
mv -f $dir/build.json.new $dir/build.json
