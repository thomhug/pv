#!/bin/bash
# tomatnine.ch - 18.02.2023

# Hol ein json von meinem Symo und vom Gen24
flow1="`curl -s http://192.168.132.11/solar_api/v1/GetPowerFlowRealtimeData.fcgi`"
flow2="`curl -s http://192.168.132.12/solar_api/v1/GetPowerFlowRealtimeData.fcgi`"
# ... und verwende es fuer die Hauszuleitung und die Batterie
grid="`echo $flow1 | jq '.Body.Data.Site.P_Grid' | awk '{printf "%0.0f", $0}'`"
batt="`echo $flow1 | jq '.Body.Data.Site.P_Akku' | awk '{printf "%0.1f", $0}'`"

echo "Grid: $grid W"
echo "Batt: $batt W"

# PV von beiden WR
pv1="`echo $flow1 | jq '.Body.Data.Site.P_PV' | awk '{printf "%0.1f", $0}'`"
pv2="`echo $flow2 | jq '.Body.Data.Site.P_PV' | awk '{printf "%0.1f", $0}'`"
if [ -z "$pv2" ]; then pv2=0; fi
pv="`echo \"scalar=2; $pv1 + $pv2\" | bc | awk '{printf "%0.0f", $0}'`"

echo "PV:  $pv W"
echo "PV1: $pv1 W"
echo "PV2: $pv2 W"

# Last muessen wir ausrechnen
load="`echo \"scalar=2; $grid + $pv1 + $pv2 + $batt\" | bc | awk '{printf "%0.0f", $0}'`"
echo "Load: $load W"

# Batterie 
soc="`curl -s http://192.168.132.11/solar_api/v1/GetStorageRealtimeData.cgi | jq '.Body.Data.\"0\".Controller.StateOfCharge_Relative'`"

# Aussentemperatur
temp="`cat /run/json_creator/json/aussentemp | awk '{printf "%0.1f", $0}'`"

echo "SOC: $soc %"
echo "Temp: $temp C"

if [ ! -z "$batt" ] && [ ! "$batt" = "0.0" ] && (( $(echo "$batt < 0" |bc -l) )); then
   batt_icon="21476"
else
   batt_icon="21586"
fi

if (( $(echo "$pv < 11" |bc -l) )); then 
    curl -s -k -X POST \
    -H "Accept: application/json" \
    -H "X-Access-Token: <ACCESSTOKEN>" \
    -H "Cache-Control: no-cache" \
    -d '{
	"frames": [
	    {
		"text": "'$load' W",
		"icon": 21256,
		"index": 1
	    },
	    {
		"text": "'$grid' W",
		"icon": 48329,
		"index": 2
	    },
	    {
		"text": "'$soc'%",
		"icon": '$batt_icon',
		"index": 3
	    },
	    {
		"text": "'$temp' °C",
		"icon": 26331,
		"index": 4
	    }
	]
    }' \
  https://10.10.11.87:4343/api/v1/dev/widget/update/com.lametric.<ID>/2 

else

  curl -s -k -X POST \
  -H "Accept: application/json" \
  -H "X-Access-Token: <ACCESSTOKEN>" \
  -H "Cache-Control: no-cache" \
  -d '{
      "frames": [
	  {
	      "text": "'$pv' W", 
	      "icon": 1246,
	      "index": 0
	  },
	  {
	      "text": "'$load' W",
	      "icon": 21256,
	      "index": 1
	  },
	  {
	      "text": "'$grid' W",
	      "icon": 48329,
	      "index": 2
	  },
	  {
	      "text": "'$soc'%",
	      "icon": '$batt_icon',
	      "index": 3
	  },
	  {
	      "text": "'$temp' °C",
	      "icon": 26331,
	      "index": 4
	  }
      ]
  }' \
  https://10.10.11.87:4343/api/v1/dev/widget/update/com.lametric.<ID>/2 
fi
