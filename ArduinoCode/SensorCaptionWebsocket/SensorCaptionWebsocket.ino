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
#define LED_PIN 15
#define LED_COUNT 4  //4 for prototype 2 w/ full goggles
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

/** MicroPressusre **/
#include <SparkFun_MicroPressure.h>
SparkFun_MicroPressure mpr;


/** vibration driver **/
Adafruit_DRV2605 drv;

// Replace with your network credentials
// const char* ssid = "RohitaK";
// const char* password = "apple123";
// const char *ssid = "atelier";
// const char *password = "ERB281282";
const char* ssid = "Franklin T10 9344";
const char *password = "417e72ea";
bool collectMode = 0;
bool gogglesOn = 0;
bool vibrateOn = 0;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

// Create a WebSocket object
AsyncWebSocket ws("/ws");

// Json Variable to Hold Sensor Readings
StaticJsonDocument<400> jsonDoc;


// Timer variables
unsigned long lastTime = 0;
unsigned long timerDelay = 500;

int intensity = 0;
#define MAX_INTENSITY 12
double playbackSpeed = 1.0;
int prevReading = 1;

int lastIntensity = 0;

bool drv_connected = false;


// Get Sensor Readings and return JSON object
String getSensorReadings() {
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

double *getRGB(double lightVal) {
  double r = 0;
  double g = 0;
  double b = 0;
  static double rgb[3];


  if (lightVal <= 6) {
    r = (255 - (255.0 / 5) * (lightVal - 1));  // e.g. 255 - (255/4)*(lightval-1)
    g = ((lightVal - 1) * (255.0 / 5));        // 255 - (255/lightVal)
    b = 0;
  } else if (lightVal >= 6) {
    if (lightVal > MAX_INTENSITY) {
      lightVal = MAX_INTENSITY;
    }
    lightVal = MAX_INTENSITY + 1 - lightVal;
    r = 0;
    g = ((lightVal - 1) * (255.0 / 5));  // 255 - (255/lightVal)

    b = (255 - (255.0 / 5) * (lightVal - 1));  // e.g. 255 - (255/4)*(lightval-1)
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
  // Serial.println(lightVal);
  memcpy(currColor, getRGB((double)lightVal), sizeof(currColor));
  memcpy(nextColor, getRGB((double)nextVal), sizeof(nextColor));

  for (int i = 0; i < 3; i++) {
    Serial.println(nextColor[i]);
  }
  if (lightVal != nextVal) {
    colorWipe(strip.Color((int)currColor[0], (int)currColor[1], (int)currColor[2]), 0);
    for (int i = 0; i < 3; i++) {
      colorIncrement[i] = (nextColor[i] - currColor[i]) / (duration / 20);
    }
    Serial.println("colorIncrement:");
    for (int i = 0; i < 3; i++) {
      Serial.println(colorIncrement[i]);
    }
    unsigned long start = millis();


    while (millis() - start < (duration / playbackSpeed)) {

      if ((millis() - start) % 40 == 0) {
        Serial.println(millis() - start);
        for (int i = 0; i < 3; i++) {
          currColor[i] += colorIncrement[i];
          // Serial.println(colorIncrement[i]);
          // Serial.println(currColor[i]);
        }
        colorWipe(strip.Color((int)currColor[0], (int)currColor[1], (int)currColor[2]), 0);
      }
    }
  }
  strip.show();
}

void colorWipe(uint32_t color, int wait) {
  for (int i = 0; i < strip.numPixels(); i++) {  // For each pixel in strip...
    strip.setPixelColor(i, color);               //  Set pixel's color (in RAM)
    strip.show();                                //  Update strip to match
    //delay(wait);                           //  Pause for a moment
  }
}

void vibrate(int value) {
  uint8_t rtv = (127 / 16) * value + 40;
  if (value <= 1) {
    rtv = 0;
  }
  drv.setRealtimeValue(rtv);
  drv.go();
  // if (value < 1) {
  //   wait = -1;
  // } else {
  //   // wait = (500 * playbackSpeed)/value;
  // timerDelay = wait;
  // int effect = 17; // "17 − Strong Click 1 - 100%"
  // drv.setWaveform(0, effect);  // play effect
  // drv.setWaveform(1, 0);       // end waveform
  // // drv.go();
}

void countDown() {
  colorWipe(strip.Color(0, 0, 0), 0);
  strip.show();
  strip.setPixelColor(0, strip.Color(255, 255, 255));
  strip.show();
  unsigned long start = millis();
  uint8_t pixCount = 1;
  while (pixCount < 4) {
    if ((millis() - start) == 1000) {
      start = millis();
      strip.setPixelColor(pixCount, strip.Color(255, 255, 255));
      pixCount++;
      Serial.println(pixCount);
      strip.show();
    }
  }
  colorWipe(strip.Color(255, 0, 0), 0);
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo *)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {

    data[len] = 0;
    Serial.printf("Received: %s\n", data);
    String message = (char *)data;
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
    if (jsonDoc["api"]["command"]["stop"] == 1) {
      vibrate(0);
    } else {
      if (haptic) {
        if (jsonDoc["api"]["command"]["vibrate"]) {
          if (!drv_connected) {
            Serial.println("Cannot vibrate, DRV not connected");
          } else {
            vibrate(jsonDoc["api"]["params"]["intensity"]);
          }
        }
      } else {
        //Serial.println("haptic not triggered");
        // vibrate(0);
      }
      if (LED) {
        if (jsonDoc["api"]["command"]["light"] == 1) {
          int curr = jsonDoc["api"]["params"]["curr_intensity"];
          int next = jsonDoc["api"]["params"]["next_intensity"];
          int duration = jsonDoc["api"]["params"]["duration"];
          duration -= 100;
          if (duration < 2400) {
            hueShift(curr, next, duration);
          }
        }
      }
      if (jsonDoc["api"]["params"]["gogglesOn"]) {
        gogglesOn = 1;
      } else {
        gogglesOn = 0;
      }
      if (jsonDoc["api"]["params"]["vibrateOn"]) {
        Serial.println("vibrate");
        vibrateOn = 1;
      } else {
        vibrateOn = 0;
      }
      if (pSensor) {
        Serial.println("Made it here");
        if (command.equals("getReadings")) {

          String sensorReadings = getSensorReadings();
          Serial.print(sensorReadings);
          notifyClients(sensorReadings);
        } else if (command.equals("collect")) {
          // if (collectMode) {
          //   vibrateOn = 0;
          //   gogglesOn = 0;
          // }
          collectMode = !collectMode;
        }
      }
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
      collectMode = 0;
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
  if (!mpr.begin()) {
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
  strip.begin();  // INITIALIZE NeoPixel strip object (REQUIRED)
  //colorWipe(strip.Color(255,   255,   255), 50); // White
  // Turn OFF all pixels ASAP
  strip.setBrightness(50);  // Set BRIGHTNESS to about 1/5 (max = 255)
  colorWipe(strip.Color(255, 0, 0), 50);
  strip.show();

  drv_connected = drv.begin();
  if (!drv_connected) {
    Serial.println("Could not find DRV2605");
    // while (1) delay(10);
  } else {
    Serial.println("DRV2605L Connected");
    drv.selectLibrary(1);
    drv.setMode(DRV2605_MODE_REALTIME);
    //drv.setMode(DRV2605_MODE_INTTRIG);
  }

  // I2C trigger by sending 'go' command
  // default, internal trigger when sending GO command


  strip.show();
  countDown();
}

void sendVal(int val) {
  StaticJsonDocument<200> doc;
  doc["val"] = val;

  // Serialize JSON to a string
  String jsonString;
  serializeJson(doc, jsonString);

  // Send JSON string over WebSocket
  ws.textAll(jsonString);
  Serial.println("Sent JSON: " + jsonString);
}

void loop() {
  if (collectMode) {
    timerDelay = 10;
    double max = 107777.0;
    double min = 98000.0;
    double scaleRange = max - min;
    if ((millis() - lastTime) > timerDelay) {
      double pressure = mpr.readPressure(PA);
      int val = (int)((pressure - min) / scaleRange * MAX_INTENSITY);
      if (val <= 0) { val = 1; }
      // double* colors = getRGB(val);
      // uint32_t color = strip.Color(colors[0],colors[1],colors[2]);
      if (val != lastIntensity) {
        if (gogglesOn) {
          hueShift(lastIntensity, val, 200);
        }
        if (vibrateOn) {
          vibrate(val);
        }
        lastIntensity = val;
        sendVal(val);
      }
      lastTime = millis();
    }

  } else {
    if ((millis() - lastTime) > timerDelay) {


      timerDelay = 1000;
      String sensorReadings = getSensorReadings();



      lastTime = millis();
    }
  }
  ws.cleanupClients();
}