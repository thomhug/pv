#!/bin/bash
# tomatnine.ch - 26.05.2024

# Das Skript pusht Werte auf ein Ulanzi TC001, welches mit der awtrix Firmware
# geflasht wurde. Das geht ganz einfach mit einem Webflasher.

duration=3

# Hol ein json von meinem Symo Gen24 1x
flow1="`curl -s http://192.168.132.11/solar_api/v1/GetPowerFlowRealtimeData.fcgi`"
flow2="`curl -s http://192.168.132.12/solar_api/v1/GetPowerFlowRealtimeData.fcgi`"
# ... und verwende es 2x fuer die Hauszuleitung und die Batterie
grid="`echo $flow1 | jq '.Body.Data.Site.P_Grid' | awk '{printf "%0.0f", $0}'`"
batt="`echo $flow1 | jq '.Body.Data.Site.P_Akku' | awk '{printf "%0.1f", $0}'`"

echo "Grid: $grid W"
echo "Batt: $batt W"

# PV von beiden WR
#pv="`curl -s 10.10.11.81/status | jq '.total_power*-1 | round'`"
pv1="`echo $flow1 | jq '.Body.Data.Site.P_PV' | awk '{printf "%0.1f", $0}'`"
pv2="`echo $flow2 | jq '.Body.Data.Site.P_PV' | awk '{printf "%0.1f", $0}'`"
pv3="`curl -s 10.10.11.43/report | jq .power| awk '{printf "%0.1f", $0}'`"
if [ -z "$pv2" ]; then pv2=0; fi
if [ -z "$pv3" ]; then pv3=0; fi

pv="`echo \"scalar=2; $pv1 + $pv2 + $pv3\" | bc | awk '{printf "%0.0f", $0}'`"

echo "PV:  $pv W"
echo "PV1: $pv1 W"
echo "PV2: $pv2 W"
echo "PV3: $pv3 W"

# Last muessen wir ausrechnen
load="`echo \"scalar=2; $grid + $pv1 + $pv2 + $pv3 + $batt\" | bc | awk '{printf "%0.0f", $0}'`"
echo "Load: $load W"

# Batterie 
soc="`curl -s http://192.168.132.11/solar_api/v1/GetStorageRealtimeData.cgi | jq '.Body.Data.\"0\".Controller.StateOfCharge_Relative'`"

# Aussentemperatur
temp="`cat /run/json_creator/json/aussentemp 2>/dev/null| awk '{printf "%0.1f", $0}'`"
if [ -z "$temp" ]; then
  temp="x"
fi

echo "SOC: $soc %"
echo "Temp: $temp C"

if [ ! -z "$batt" ] && [ ! "$batt" = "0.0" ] && (( $(echo "$batt < 0" |bc -l) )); then
   batt_icon="21476"
else
   batt_icon="21586"
fi

if (( $(echo "$pv < 11" |bc -l) )); then 
    curl -s -k -X POST \
    -H "Content-Type: application/json" \
    -d '[
	    {
		"text": "'$load' W",
		"icon": 21256,
		"duration": "'$duration'"
	    },
	    {
		"text": "'$grid' W",
		"icon": 48329,
		"duration": "'$duration'"
	    },
	    {
		"text": "'$soc'%",
		"icon": '$batt_icon',
		"duration": "'$duration'"
	    },
	    {
		"text": "'$temp' °C",
		"icon": 26331,
		"duration": "'$duration'"
	    }

	]' \
    "http://10.10.11.79/api/custom?name=pv"

    # letzte app loeschen
    curl -s -k -X POST \
    -H "Content-Type: application/json" \
    -d '{}' \
    "http://10.10.11.79/api/custom?name=pv4"

else

    curl -s -k -X POST \
    -H "Content-Type: application/json" \
    -d '[
	    {
	        "text": "'$pv' W", 
  	        "icon": 1246,
		"duration": "'$duration'"
            },
            {
                "text": "'$load' W",
                "icon": 21256,
		"duration": "'$duration'"
            },
            {
                "text": "'$grid' W",
                "icon": 48329,
		"duration": "'$duration'"
            },
            {
                "text": "'$soc'%",
                "icon": '$batt_icon',
		"duration": "'$duration'"
            },
            {
                "text": "'$temp' °C",
                "icon": 26331,
		"duration": "'$duration'"
            }
        ]' \
    "http://10.10.11.79/api/custom?name=pv"
fi

echo

