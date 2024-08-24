## ArduinoCode Guide by Roy
### All Code written by Roy

### esp2gsheets
 contains the code to be flashed to the ESP32 during data collection of experts. It should record pressure data to a Google Spreadsheet and create a new Google Spreadsheet each time the ESP32 is reset or run again. Most of the code follows this guide: https://electropeak.com/learn/sending-data-from-esp32-or-esp8266-to-google-sheets-2-methods/ 

Current Issues: 
 - Permission Denied when trying to open spreadsheet on any google account except for Roy's google account. Trying to sort this out right now with Charlie. 

 ### SensorCaptionsWebsocket
  contains the code to be flashed to the ESP32 when using the WebApp. It should activate all the sensory feedback mechanisms depending on websocket messages from the WebApp. 

Current Issues:
- If the video buffers, feedback mechanisms will breakdown
- General webapp issue: Turning on/off certain feedback options in combination with multiple options on at the same time or pausing, rewinding, slowing etc. can falsely trigger or fail to trigger the feedback. 

### SensorCollection
 Old code for collecting pressure and IMU data and storing it onto an SD Card. 

 Current Issues:
- Inconsistent SD card logging, ~1/5 trials would actually save onto the SD card for some reason. 

## OldArchive
Everything in here is pretty much dead except: 

### Sensors4Python
Flash this to the ESP32 when you want to use any code from DataProcessing/Visualization/PressureLiveViz.ipynb 