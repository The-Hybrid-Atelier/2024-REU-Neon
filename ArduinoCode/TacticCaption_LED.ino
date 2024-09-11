#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <SparkFun_MicroPressure.h>
#include <Adafruit_NeoPixel.h>

// Network credentials
#define WIFI_SSID "atelier"
#define WIFI_PASS "ERB281282"
#define WS_ADDR "haws.cearto.com"
#define WS_PORT 3048

// Device and sensor setup
#define BAUD 115200
#define DEVICE_NAME "tacit-caption-physical"
#define VBATPIN 9

SparkFun_MicroPressure mpr;
DynamicJsonDocument json(4096 * 4);

WiFiClient wifi;
websockets::WebsocketsClient client;

bool pressure_on = true;
bool isFirstMessage = true;
unsigned long startTime;

/** NeoPixel Light Strip **/
#define LED_PIN 15
#define LED_COUNT 4  // Number of LEDs in the strip
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

void led_color(int r, int g, int b){
   for(int i=0; i<strip.numPixels(); i++) { // For each pixel in strip...
    strip.setPixelColor(i, strip.Color(r, g, b));         //  Set pixel's color (in RAM)
    strip.show();                          //  Update strip to match
    delay(20);                           //  Pause for a moment
  }
}

void neopixel_setup(){
  strip.begin();           // INITIALIZE NeoPixel strip object (REQUIRED)
  strip.show();            // Turn OFF all pixels ASAP
  strip.setBrightness(50); // Set BRIGHTNESS to about 1/5 (max = 255)  
  colorWipe(strip.Color(255, 0, 0), 50);
  strip.show();
}

void colorWipe(uint32_t color, int wait) {
  for (int i = 0; i < strip.numPixels(); i++) {  // Loop through all pixels
    strip.setPixelColor(i, color);               // Set each pixel's color
    strip.show();                                // Update the strip to match
    delay(wait);                                 // Wait for a brief moment (optional)
  }
}

void sendJSON(DynamicJsonDocument* json) {
  String message;
  serializeJson(*json, message);
  if (client.send(message)) {
    Serial.println("Message sent successfully:");
  } else {
    Serial.println("Failed to send message:");
  }
  Serial.println(message);
  json->clear();
}

void pressure_read() {
  float pressurePA = mpr.readPressure(PA);
  uint32_t pressure = static_cast<uint32_t>(pressurePA);
  json["event"] = "read-pressure";
  json["time"] = millis();
  JsonArray data = json.createNestedArray("data");
  data.add(pressure);

  if (isFirstMessage) {
    startTime = millis();
    unsigned long elapsedTime = millis() - startTime;
    float samplingRate = 1.0 / ((float)elapsedTime / 1000.0);
    json["elapsedTime"] = elapsedTime;
    json["samplingRate"] = samplingRate;
    isFirstMessage = false;
  }

  if (json.overflowed()) {
    Serial.println("ERROR: JSON document overflowed!");
  }

  sendJSON(&json);
}

void apiCall(String prefix, JsonObject obj) {
  Serial.print("API CALL: ");
  Serial.println(prefix);
  
  if (prefix == "PRESSURE_ON") {
        pressure_on = true;
        Serial.println("Reading pressure... (pressure_on = true)");
  } 
  else if (prefix == "PRESSURE_OFF") {
        pressure_on = false;
        Serial.println("Stopped reading pressure... (pressure_on = false)");
  } 
  else if (prefix == "LED_COLOR") { 
        int red = obj["red"];
        int green = obj["green"];
        int blue = obj["blue"];
        led_color(red, green, blue);  // Use the obtained color values
  } 
  else {
      Serial.println("COMMAND NOT FOUND");
  }
}

void apiLoop() {
  static unsigned long lastReadTime = 0;
  const unsigned long readInterval = 10;  // interval in milliseconds

  if (pressure_on) {
    unsigned long currentTime = millis();
    if (currentTime - lastReadTime >= readInterval) {
      pressure_read();
      lastReadTime = currentTime;
    }
  }
}

void listen() {
    if (client.available()) {
        client.poll();
    }
    apiLoop();
    delay(30);
} 

void setup() {
  Serial.begin(BAUD);

  Wire.begin();
  if (!mpr.begin()) {
    Serial.println("Cannot connect to MicroPressure sensor.");
    while (1);
  }

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");

  bool connected = client.connect(WS_ADDR, WS_PORT, "/");
  if (connected) {
    Serial.println("WebSocket Connected!");
    json["name"] = DEVICE_NAME;
    json["event"] = "greeting";
    json["data"] = 0;
    sendJSON(&json);
  } else {
    Serial.println("WebSocket Connection Failed!");
    return;
  }

  client.onMessage([&](websockets::WebsocketsMessage message) {
    Serial.print("Got Message: ");
    String response = message.data();
    Serial.println(response);

    DeserializationError error = deserializeJson(json, response);
    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      return;
    }

    JsonObject obj = json.as<JsonObject>();
    if (obj.containsKey("api")) {
      JsonObject apiObj = obj["api"];
      if (apiObj.containsKey("command")) {
        String command = apiObj["command"];
        JsonObject params = apiObj["params"];
        apiCall(command, params);
      }
    }
    json.clear();
    Serial.println("Message processing complete.");
  });
  
  neopixel_setup();
}

void loop() {
  listen();
}
