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
#include <ArduinoJson.h>
// #include <Adafruit_BME280.h>
#include <Adafruit_NeoPixel.h>
#include <string.h>
#include "Adafruit_DRV2605.h"

/** NeoPixel Light Strip **/
#define LED_PIN    32
#define LED_COUNT 4 //4 for prototype 2 w/ full goggles
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

/** MicroPressusre **/
#include <SparkFun_MicroPressure.h>
SparkFun_MicroPressure mpr;


/** vibration driver **/
Adafruit_DRV2605 drv;

// Replace with your network credentials
// const char* ssid = "RohitaK";
// const char* password = "apple123";
const char* ssid = "atelier";
const char* password = "ERB281282";
bool collectMode = 0;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

// Create a WebSocket object
AsyncWebSocket ws("/ws");

// Json Variable to Hold Sensor Readings
StaticJsonDocument<200> jsonDoc;

// Timer variables
unsigned long lastTime = 0;
unsigned long timerDelay = 500;

int intensity = 0;
#define MAX_INTENSITY 12
double playbackSpeed = 1.0;
int prevReading = 1;

int lastIntensity = 0;

bool drv_connected = false;
int wait = -1;

// Get Sensor Readings and return JSON object
String getSensorReadings(){
  return String(mpr.readPressure(PA));
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
  playbackSpeed = jsonDoc["playbackSpeed"];
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

void vibrate(int value) {
  if (value < 1) {
    wait = -1;
  } else {
    wait = (500 * playbackSpeed)/value;
    timerDelay = wait;
    int effect = 17; // "17 − Strong Click 1 - 100%"
    drv.setWaveform(0, effect);  // play effect 
    drv.setWaveform(1, 0);       // end waveform
    // drv.go();
  }
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;
    Serial.printf("Received: %s\n", data);
    String message = (char*)data;
    // Check if the message is "vibrate"
    Serial.println(message);
    DeserializationError error = deserializeJson(jsonDoc, data);
      if (error) {
        Serial.print("deserializeJson() failed: ");
        Serial.println(error.f_str());
        return;
    }
    //String device = jsonDoc["device"]; //haptic, LED, Pressure Sensor
    String command = jsonDoc["api"]["command"];
    int haptic = jsonDoc["device"]["haptic"];
    int LED = jsonDoc["device"]["LED"];
    int pSensor = jsonDoc["device"]["Pressure Sensor"];
    //Serial.println(device);
    //Serial.println(jsonDoc["device"]["light"]);
    if (haptic){
      if (jsonDoc["api"]["command"]["vibrate"] == 1) {
        if(!drv_connected) {
          Serial.println("Cannot vibrate, DRV not connected");
        } else {
          vibrate(jsonDoc["api"]["params"]["intensity"]);
        }
      }
    } else {
      //Serial.println("haptic not triggered");
      wait = -1;
    }
    if (LED) {
      if (jsonDoc["api"]["command"]["light"] == 1) {
        int curr = jsonDoc["api"]["params"]["curr_intensity"];
        int next = jsonDoc["api"]["params"]["next_intensity"];
        int duration = jsonDoc["api"]["params"]["duration"];
        if (duration < 3000) {
          hueShift(curr, next, duration);
        }
      }
    } 
    if (pSensor) {
      if (command.equals("getReadings")) {
        String sensorReadings = getSensorReadings();
        Serial.print(sensorReadings);
        notifyClients(sensorReadings);
      } else if (command.equals("collect")) {
        
        collectMode = !collectMode;
      }
    }
    if(jsonDoc["api"]["command"]["stop"] == 1) {
      vibrate(0);
    }
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
  strip.setBrightness(200); // Set BRIGHTNESS to about 1/5 (max = 255)
  colorWipe(strip.Color(255,   0,   0), 50);
  strip.show();
  
  drv_connected = drv.begin();
  if (!drv_connected) {
    Serial.println("Could not find DRV2605");
    // while (1) delay(10);
  } else {
    Serial.println("DRV2605L Connected");
    drv.selectLibrary(1);
    drv.setMode(DRV2605_MODE_INTTRIG); 
  }
  
  // I2C trigger by sending 'go' command 
  // default, internal trigger when sending GO command
  

  strip.show();
}

void loop() {
  if (collectMode) {
    timerDelay = 200;
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
    //timerDelay = 10000;
    //Serial.printf("wait = %d", wait);
    if ((millis() - lastTime) > timerDelay) {
      if (wait > 0) {
        timerDelay = wait;
        drv.go();
      } else {
        timerDelay = 1000;
        String sensorReadings = getSensorReadings();
        // Serial.print(sensorReadings);
        // notifyClients(sensorReadings);
      }
      
      
      lastTime = millis();
    }
  }
  ws.cleanupClients();
}