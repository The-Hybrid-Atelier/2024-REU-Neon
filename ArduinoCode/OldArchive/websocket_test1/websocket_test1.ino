/*********
  Rui Santos & Sara Santos - Random Nerd Tutorials
  Complete instructions at https://RandomNerdTutorials.com/esp32-websocket-server-sensor/
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*********/
#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include "LittleFS.h"
#include <Arduino_JSON.h>
// #include <Adafruit_BME280.h>
#include <Adafruit_NeoPixel.h>
#include <string.h>

/** NeoPixel Light Strip **/
#define LED_PIN    14
#define LED_COUNT 5 //5 for prototype1, 
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

/** MicroPressusre **/
#include <SparkFun_MicroPressure.h>
SparkFun_MicroPressure mpr;

// Replace with your network credentials
const char* ssid = "RohitaK";
const char* password = "apple123";
bool collectMode = 0;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

// Create a WebSocket object
AsyncWebSocket ws("/ws");

// Json Variable to Hold Sensor Readings
JSONVar readings;

// Timer variables
unsigned long lastTime = 0;
unsigned long timerDelay = 30000;

int intensity = 0;
#define MAX_INTENSITY 12
double playbackSpeed = 1.0;
int prevReading = 1;

int lastIntensity = 0;

// Get Sensor Readings and return JSON object
String getSensorReadings(){
  readings["pressure"] = "pressure";//String(mpr.readPressure(PA));
  String jsonString = JSON.stringify(readings);
  return jsonString;
}

void listDir(fs::FS &fs, const char *dirname, uint8_t levels) {
  Serial.printf("Listing directory: %s\r\n", dirname);

  File root = fs.open(dirname);
  if (!root) {
    Serial.println("- failed to open directory");
    return;
  }
  if (!root.isDirectory()) {
    Serial.println(" - not a directory");
    return;
  }

  File file = root.openNextFile();
  while (file) {
    if (file.isDirectory()) {
      Serial.print("  DIR : ");
      Serial.println(file.name());
      if (levels) {
        listDir(fs, file.path(), levels - 1);
      }
    } else {
      Serial.print("  FILE: ");
      Serial.print(file.name());
      Serial.print("\tSIZE: ");
      Serial.println(file.size());
    }
    file = root.openNextFile();
  }
}


// Initialize LittleFS
void initLittleFS() {
  if (!LittleFS.begin(true)) {
    Serial.println("An error has occurred while mounting LittleFS");
    
  }
  Serial.println("LittleFS mounted successfully");
  listDir(LittleFS, "/", 3);
}

// Initialize WiFi
void initWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi ..");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println(WiFi.localIP());
}

void notifyClients(String sensorReadings) {
  ws.textAll(sensorReadings);
}

double* getRGB(double lightVal) {
  double r = 0;
  double g = 0;
  double b = 0;
  static double rgb[3];
  
  Serial.print("LightVal = ");
  Serial.println(lightVal);
  if(lightVal <= 6) {
    r = (255 - (255.0/5)*(lightVal-1)); // e.g. 255 - (255/4)*(lightval-1) 
    Serial.print("r = ");
    Serial.println(r);
    g = ((lightVal-1) * (255.0/5)); // 255 - (255/lightVal)
    Serial.print("g = ");
    Serial.println(g);
    b = 0;
  } else if (lightVal >= 6) {
    if (lightVal > MAX_INTENSITY) {
       lightVal = MAX_INTENSITY;
    }
    lightVal = MAX_INTENSITY+1-lightVal;
    r = 0;
    g = ((lightVal-1) * (255.0/5)); // 255 - (255/lightVal)
    Serial.print("g = ");
    Serial.println(g);
    b = (255 - (255.0/5)*(lightVal-1)); // e.g. 255 - (255/4)*(lightval-1) 
    Serial.print("b = ");
    Serial.println(b);
  } 
  rgb[0] = r;
  rgb[1] = g;
  rgb[2] = b;
  
  return rgb;
}

void hueShift(int lightVal, int nextVal, int duration) {
  static double currColor[3];
  static double nextColor[3];
  static double colorIncrement[3];
  Serial.println(lightVal);
  memcpy(currColor,getRGB((double)lightVal),sizeof(currColor));
  memcpy(nextColor,getRGB((double)nextVal),sizeof(nextColor));
  
  for(int i = 0; i < 3; i++) {
    Serial.println(nextColor[i]);
  }
  if (lightVal != nextVal) {
    colorWipe(strip.Color((int)currColor[0],(int)currColor[1],(int)currColor[2]), 0);
    for (int i = 0; i < 3; i++) {
      colorIncrement[i] = (nextColor[i] - currColor[i])/(duration/20);
    }
    Serial.println("colorIncrement:");
    for(int i = 0; i < 3; i++) {
      Serial.println(colorIncrement[i]);
    }
    unsigned long start = millis();
    
    while (millis() - start < (duration * playbackSpeed)) {

      if ((millis() - start) % 20 == 0 && (millis() - start) > 19) {
        Serial.println("currColor: ");
        for(int i = 0; i < 3; i++) {
          currColor[i] += colorIncrement[i];
          Serial.println(colorIncrement[i]);
          Serial.println(currColor[i]);
        }
        colorWipe(strip.Color((int)currColor[0],(int)currColor[1],(int)currColor[2]), 0);
      }
    }
  }
  strip.show();
}

void colorWipe(uint32_t color, int wait) {
  for(int i=0; i<strip.numPixels(); i++) { // For each pixel in strip...
    strip.setPixelColor(i, color);         //  Set pixel's color (in RAM)
    strip.show();                          //  Update strip to match
    //delay(wait);                           //  Pause for a moment
  }
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;
    
    String message = (char*)data;
    // Check if the message is "vibrate"
    Serial.println(message);
    if (collectMode) {
      collectMode = !collectMode;
      timerDelay = 30000;
    } else {
      if (message.startsWith("NO VIBRATION RIGHT NOW")) {  //"vibrate"
        String numberPart = message.substring(7); // "vibrate" is 7 characters long

        // Convert the extracted part to an integer
        int vibrationValue = numberPart.toInt();
        Serial.println(vibrationValue);
        intensity = (255/MAX_INTENSITY + 1) * vibrationValue;
        Serial.println(intensity);
        analogWrite(A0, intensity);
      } else if (message.startsWith("collect")) {
        timerDelay = 200;
        collectMode = !collectMode;
      } else if (message.startsWith("light")) {
        String input = message.substring(5); // "light" is 5 characters long
        int commaIndex1 = input.indexOf(',');
        if (commaIndex1 != -1) {
          String curr = input.substring(0, commaIndex1);
          input = input.substring(commaIndex1 + 1);
          Serial.println(input);
          int commaIndex2 = input.indexOf(',');
          String next = input.substring(0, commaIndex2);
          Serial.println(next);
          String dur = input.substring(commaIndex2 + 1);
          Serial.println(dur);
          double lightVal = curr.toInt();
          double nextVal = next.toInt();
          double duration = dur.toInt();
          if (duration < 3000) {
            hueShift(lightVal, nextVal, duration); 
          }
          strip.show();
          
        } else if (message.startsWith("playbackspeed")) {
          String playbackMsg= message.substring(13);
          playbackSpeed = playbackMsg.toDouble();
        } else {
          Serial.println("Light message received but missing comma between curr & next values.");
        }
        
      }
    }
      //if it is, send current sensor readings
      String sensorReadings = getSensorReadings();
      Serial.print(sensorReadings);
      notifyClients(sensorReadings);
    //}
  }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
      break;
    case WS_EVT_DISCONNECT:
      Serial.printf("WebSocket client #%u disconnected\n", client->id());
      break;
    case WS_EVT_DATA:
      handleWebSocketMessage(arg, data, len);
      break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      break;
  }
}

void initWebSocket() {
  ws.onEvent(onEvent);
  server.addHandler(&ws);
}


void setup() {
  Serial.begin(115200);
  //initBME();
  initWiFi();
  initLittleFS();
  initWebSocket();
  
  pinMode(A0, OUTPUT);

  Wire.begin();
  Wire.setClock(400000);
  if(!mpr.begin()) {
    Serial.println("Can't connect to MicroPressure Sensor");
    while(1);
  } else {
    Serial.println("MicroPressure Sensor Connected");
  }

  // Web Server Root URL
  // server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
  //   request->send(LittleFS, "/index.html", "text/html");
  // });

  server.serveStatic("/", LittleFS, "/");

  // Start server
  server.begin();

  /** Neopixel Strip initialization **/
  strip.begin();           // INITIALIZE NeoPixel strip object (REQUIRED)
  //colorWipe(strip.Color(255,   255,   255), 50); // White
              // Turn OFF all pixels ASAP
  strip.setBrightness(50); // Set BRIGHTNESS to about 1/5 (max = 255)
  strip.show();
}

void loop() {
  if (collectMode) {
  
    
    double max = 107777.0;
    double min = 98000.0;
    double scaleRange = max - min;
    if ((millis() - lastTime) > timerDelay) {
      double pressure = mpr.readPressure(PA);
      int val = (int)((pressure - min)/scaleRange * MAX_INTENSITY);
      if (val <= 0) {val = 1;}
      // double* colors = getRGB(val);
      // uint32_t color = strip.Color(colors[0],colors[1],colors[2]);
      if( val != lastIntensity ) {
        
        hueShift(lastIntensity, val, 200);
        lastIntensity = val;
      }
    }
      
  } else {
    if ((millis() - lastTime) > timerDelay) {
      String sensorReadings = getSensorReadings();
      Serial.print(sensorReadings);
      notifyClients(sensorReadings);
      lastTime = millis();
    }
  }
  ws.cleanupClients();
}