/**
 Created by M.Merati

 Email: majid.merati.2012@gmail.com
*/

// This example shows how to create the spreadsheet, update and read the values.

#include <Arduino.h>
#if defined(ESP32) || defined(ARDUINO_RASPBERRY_PI_PICO_W)
#include <WiFi.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#endif
#include <ESP_Google_Sheet_Client.h>
#include <stdlib.h>
#include "time.h"
const char *ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 19800;
const int daylightOffset_sec = 0;
int SensValue = 0;

/** MicroPressusre **/
#include <SparkFun_MicroPressure.h>
SparkFun_MicroPressure mpr;

// For SD/SD_MMC mounting helper
#include <GS_SDHelper.h>

#define WIFI_SSID "RohitaK"
#define WIFI_PASSWORD "apple123"

#define PROJECT_ID "reu-neon"

// Service Account's client email
#define CLIENT_EMAIL "esp32upload@reu-neon.iam.gserviceaccount.com"

// Your email to share access to spreadsheet
#define USER_EMAIL "lroyliao@gmail.com"

char numberArray[20];

// Service Account's private key
const char PRIVATE_KEY[] PROGMEM = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCQlIc4mr3XvQMR\nEmrfyCduiZ41x7jZCa2bmZZKURq2w4SLiiZ9Mee0iHKVAtMYZehmoHfUESPBX3fW\nhA6CL+GsWLxWTyxw9BV3c5aVsoajls7zegC0oFSCi7ESHvgIkraC9MmLEDfizcPb\naSDaBta0fjbdqt6x3seeXuHYEdcTyKpaK4DpNkeJxv9wnxcDY90y6FTlmv88Zpqb\no9bfvTSvfMkBd3kWGb/bdzbCHLSuTYYg+9EoCU9hvDs8HoAYGYKD8nXh/A/RluCe\nXPWxRgZPdKBETS8uHmRh7QrjT0mg0Tx0pF01QgvqLxHGWRAfUzUlrDPwj1wiD9ZA\nsybGklHrAgMBAAECggEABKbKrO8JkZHSse9qQdXiMuO5k9hfoZf2nm10EOMIHX4v\n2v9wWpHK9xt2uEWVfhD1R6v8/vUoNdX4+I1aHCUnORDHym0UrHOl5yhwXVOXklbN\nRLcVo7oOzf5pjYAykbAKsC7o9xDoA2OEXCBHPsx+huMSp9ISBR36RSWfVYDJbyj2\nsO+9+HMvWSBIY88PdGNP3YUCEb4AfGMJAusUI5eZkwrH592OQtIyn/SpZM71Bmi5\nwtJFhYGmCyazPLSrirHppLpGW4/mJ/90oPwMuq36FFkJJrn8fYkiS2r+mvFTN0Fm\nkRpuNtMdYdSydIDMuq4JYOcwVH/5J8MXMgx5HLbkaQKBgQDKYFcpJvTWEmKJcPIM\nbZjlS3t6qBQfYtyD8zwkZ4zig+BWf8i0HtLXE1mCAgyTEQE7Dz9zd9BPZBhujG5D\nZdiuccthzP90adss7lAOgih9PRKA4BgkX18ewAhhJ+OA7svODvbWDDXwFPzJZ86H\na6g0GFlmC5r1DQUv/BuK4eDgswKBgQC2472HRNEZhn4Tw6ShwEFQzIwqleg4X6NL\nS9EEKPADLHqEwvJxJR2TGyDCeTyHMWRP+xaYW6M7BZ+f1eJZyoqbSwtyUYpzty9F\noj+RMhCiWNmIYdKrzIvvTRySL4Apg0NQGqUNG+UMmh6Er/qCc5cV0i/eoGFKpJU/\neYIJ3vx16QKBgCY7bxvyJRzwGjd24/NfHRxsVyaD7FFFnv06jWkfOulsGoyc1XDZ\nxeEl4aoC8xcxhjb/GXCZ+PuWoFr6IraO3hGOo+qVDMmUWfiyCOPEyRtn10ALleQB\nNHodszePjpZEBrKl9xHW+rWhcWQnPUguGXfGBdWWaa7Tx+AZ06Y4KACrAoGAP7uB\nMoBCtbhuewi0eEF9AWEmfziaIfsB9p1HC0IQ0apQT693uQIMGlVbxylkdGA76rs/\nFnzolwrQo2xvYob4YkF2jbHoo4Z0jLmLmVdvAIQh2irstT2kjhG7IR44dT7u2B1Q\n4w6TdR7H/8krbQZG4i3KzLPq844DDImVTUdNhvECgYAKez4artSt2yUebtXPRWbs\nnhQtnrt6ckLWqZKzRT9wdDDEVCFWIUOqk0vHhZMZ37FXMZ0Mu8hkhKni+NPZXPMQ\nYon5Y9AKc6ixdDuiT/HWfyTnEok4U4ZH7B2dFSu/j6h+HA+R/vhsinlWYzBNacTj\nrc0WslghPxgbzuj67k82+g==\n-----END PRIVATE KEY-----\n";

bool taskComplete = false;

#if defined(ARDUINO_RASPBERRY_PI_PICO_W)
WiFiMulti multi;
#endif

void tokenStatusCallback(TokenInfo info);

void setup() {

  Serial.begin(115200);
  Serial.println();
  Serial.println();

#if defined(ESP32) || defined(ESP8266)
  WiFi.setAutoReconnect(true);
#endif

#if defined(ARDUINO_RASPBERRY_PI_PICO_W)
  multi.addAP(WIFI_SSID, WIFI_PASSWORD);
  multi.run();
#else
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
#endif

  Serial.print("Connecting to Wi-Fi");
  unsigned long ms = millis();
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
#if defined(ARDUINO_RASPBERRY_PI_PICO_W)
    if (millis() - ms > 10000)
      break;
#endif
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Set the callback for Google API access token generation status (for debug only)
  GSheet.setTokenCallback(tokenStatusCallback);

  // The WiFi credentials are required for Pico W
  // due to it does not have reconnect feature.
#if defined(ARDUINO_RASPBERRY_PI_PICO_W)
  GSheet.clearAP();
  GSheet.addAP(WIFI_SSID, WIFI_PASSWORD);
#endif

  // Set the seconds to refresh the auth token before expire (60 to 3540, default is 300 seconds)
  GSheet.setPrerefreshSeconds(10 * 60);

  // Begin the access token generation for Google API authentication
  GSheet.begin(CLIENT_EMAIL, PROJECT_ID, PRIVATE_KEY);

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  GSheet.setSystemTime(GSheet.getExpiredTimestamp());
  mpr.begin();

}

void loop() {
  // Call ready() repeatedly in loop for authentication checking and processing
  bool ready = GSheet.ready();

  if (ready && !taskComplete) {
    FirebaseJson response;

    Serial.println("\nCreate spreadsheet...");
    Serial.println("------------------------");

    FirebaseJson spreadsheet;
    spreadsheet.set("properties/title", "Gas Sensor Data Log");
    spreadsheet.set("sheets/properties/gridProperties/rowCount", 100);
    spreadsheet.set("sheets/properties/gridProperties/columnCount", 2);

    String spreadsheetId, spreadsheetURL;
    bool success = false;

    // For Google Sheet API ref doc, go to https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/create

    success = GSheet.create(&response /* returned response */, &spreadsheet /* spreadsheet object */, USER_EMAIL /* your email that this spreadsheet shared to */);
    response.toString(Serial, true);
    Serial.println();


    if (success) {
      // Get the spreadsheet id from already created file.
      FirebaseJsonData result;
      response.get(result, FPSTR("spreadsheetId"));  // parse or deserialize the JSON response
      if (result.success)
        spreadsheetId = result.to<const char *>();

      // Get the spreadsheet URL.
      result.clear();
      response.get(result, FPSTR("spreadsheetUrl"));  // parse or deserialize the JSON response
      if (result.success) {
        spreadsheetURL = result.to<const char *>();
        Serial.println("\nThe spreadsheet URL");
        Serial.println(spreadsheetURL);
      }

      struct tm timeinfo;
      char timeStringBuff[50];
      String asString;
      char buffer[40];


      FirebaseJson valueRange;
      for (int counter = 0; counter < 10; counter++) {
        Serial.println("\nUpdate spreadsheet values...");
        Serial.println("------------------------------");
        if (!getLocalTime(&timeinfo)) {
          Serial.println("Failed to obtain time");
          return;
        }
        strftime(timeStringBuff, sizeof(timeStringBuff), "%A, %B %d %Y %H:%M:%S", &timeinfo);
        asString = timeStringBuff;
        asString.replace(" ", "-");
        float value = mpr.readPressure(PA);
        SensValue = (int)value;
        itoa(SensValue, numberArray, 10);

        sprintf(buffer, "values/[%d]/[1]", counter);
        valueRange.set(buffer, numberArray);
        sprintf(buffer, "values/[%d]/[0]", counter);
        valueRange.set(buffer, asString);
        sprintf(buffer, "Sheet1!A%d:B%d", 1 + counter, 10 + counter);

        success = GSheet.values.update(&response /* returned response */, spreadsheetId /* spreadsheet Id to update */, "Sheet1!A1:B1000" /* range to update */, &valueRange /* data to update */);
        response.toString(Serial, true);
        Serial.println();
        //valueRange.clear();
        delay(5000);
      }

      // For Google Sheet API ref doc, go to https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update

      if (success) {

        Serial.println("\nGet spreadsheet values...");
        Serial.println("------------------------------");

        success = GSheet.values.get(&response /* returned response */, spreadsheetId /* spreadsheet Id to read */, "Sheet1!A1:B10" /* range to read */);
        response.toString(Serial, true);
        Serial.println();



#if defined(ESP32) || defined(ESP8266)
        Serial.println(ESP.getFreeHeap());
#elif defined(PICO_RP2040)
        Serial.println(rp2040.getFreeHeap());
#endif
      }
    }

    taskComplete = true;
  }
}

void tokenStatusCallback(TokenInfo info) {
  if (info.status == esp_signer_token_status_error) {
    Serial.printf("Token info: type = %s, status = %s\n", GSheet.getTokenType(info).c_str(), GSheet.getTokenStatus(info).c_str());
    Serial.printf("Token error: %s\n", GSheet.getTokenError(info).c_str());
  } else {
    Serial.printf("Token info: type = %s, status = %s\n", GSheet.getTokenType(info).c_str(), GSheet.getTokenStatus(info).c_str());
  }
}
