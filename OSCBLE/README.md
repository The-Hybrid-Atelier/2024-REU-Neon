    

# Neon Thing Instructions

## ThingPlus
* Turn on the ThingPlus with label TP5

## React App (anywhere, e.g., Codespace)
* Open the React app and navigate to the Video Player
* Select Sensor input
`cd sensor-captions-app`
`npm run dev`

* Run the BLE client (must be from your Computer)
Your computer must be connected to the Internet. 
`cd OSCBLE/server`
`pip install -r requirements.txt`    
`python neonthing.py`

You should see the React app go from CONNECTING... to LIVE
* Press the ON button to start streaming sensor data!

# Development notes

## Installation
`pip install -r requirements.txt`   


## Communication
For each thing, generate three unique UUIDs.
https://www.uuidgenerator.net/

Edit:
`config.py` and the corresponding `.ino` file.
Update device name, service UUID, TX UUID, and RX UUID. 

