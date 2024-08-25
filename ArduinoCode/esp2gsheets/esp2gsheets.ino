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

#define WIFI_SSID "atelier"
#define WIFI_PASSWORD "ERB281282"

#define PROJECT_ID "sensorcaptions"

// Service Account's client email
#define CLIENT_EMAIL "sensorcaptionsesp32@sensorcaptions.iam.gserviceaccount.com"
// Your email to share access to spreadsheet
#define USER_EMAIL "sensorcaptiondata@gmail.com"

char numberArray[20];

// Service Account's private key
  
const char PRIVATE_KEY[] PROGMEM = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDG+EWWBzBhyR23\nnSncg9MOnl0OqaqwFSgFfrm4yIm+Tn7ExjnXnX8k9QuwUN6ijU9+EoPSfbo9tkxy\nFD9Oot94BhI3iDsPUA0pP8tPuBmczSeIpPs7FfILnyRVIYX/GvJIOfB8WU5OUb18\ncYPubBQBgXylvpg90dQi6ajfln2ZN206YB1xJPBIC9v26KpgMMJWrkTslRulBvLw\nd7YcvAtByEjFXtT+7PTXgFpfcM/YsGrD3LPXsUhuw+k/YBQwO9WTePuer8I3ozrr\nj2TV0bCLt2sTWu478AcsOVj2YaD6haEhTzR5mAxbvdLiZsW/N03kGTJlIpIqaoY/\nCyE0L/EXAgMBAAECggEAXUTKUc6i5mPBU24PznfY+tRPaO0tvwbb0N+brbwLnbLs\nB8+oE6OXkzpvNUJjaq11IvMI6iXXpNAMu7k0B+efe4LVDUUF8mKjGL/3zTHOh8s/\nifVUc1kRMlNyU5m4V2JJSoQmcBPo+hulCG2p25y8MAyD4qoacXgnygngCJdh3uzh\n5k5f2qbJz0At9F0OLOst19KVh9qyZkkBGj0QwOHwU2X7VvtMNVWTpwOkFH/lUrOW\n+qHpMERcK0VOAMnwLOZeCIq2uH1dq4pvJzth9yQy84LjaUm6ByVMivGCbUWTXwb0\nXnw7Woyv7ElxaYvoMB5/mNv6xqQcaDxx2NRq66DWcQKBgQDiFOd47EIbpO7MpY5t\n9nwosFeu9oq2WqpCXIFaeXHeZYfqm/7070UPv9iFl8e4r9g77B+e2gl+eboxZjFG\nXn7+DbUYhFCFqISCkEu+slAKHIvwxd8E8bxupkRZzaKRMHuCB32ODl9/k00sNynW\nXmTI3HJ8OzS/ppUcQ8CseX6iSQKBgQDhTOJlbePI+pgWY1XMXeUCSbq2gaJY0OeB\ny00BVThITF7HAAuo5BnIcDvM8he4v9LYGh7ln83M+hEy72ycUFzDIdy5zXttDMgd\n/2VnkdfYt+bygXCEcbbV9f6eSgUt1U2ZbTHOfo2iiFBnlFHHPNWfNZpugs1SrtM9\nBb8jOSP4XwKBgDBAK+K38af6vGh60PoRCBCbCiuyPIqMsRe2rHjFwJKpcqeUoYZe\n5otk824Xpa16AhlP3LPHbw1KJ33RhKSzGEFaZZMU8iaEf7tp1nCdl82AqDE72cwx\nV3j6DU5pP8/i3Ak1VguSb7lHk8njAA/bV4Ey41A2Rpy8jchZgW6OA4PZAoGAKIDv\n+pgk6U7T5MJ6/ECtGRo0LPdlPl5gIF9yOpkdgzHnoBMMBZLsZ7J1rcSgKyChQSSB\nBXsTPpR+Xw/YEMoJwzLlQaoFVHeFyo7Npi78BQQayuImXkkrO4/79G0OPU0ppDmT\nSLJLuDqVaemqQg1XwkWau99cFk9Dvqa31BdDtjUCgYEAq/2FFuQNv/hivY2sgheq\nK3hs3MhEohI4t154oDO9U0S4j+X3khv/9He8YMFCKSF+8omqYrBTuozH/XYjk89u\nmM8KeIbxP8x/1NHoIzuHrJ4ndph04S4HkxvE10+J6H9nJ/hA2PnA5ogikQpiGzSK\n9XQ8m3vfetrzbmoUmVJjcXc=\n-----END PRIVATE KEY-----\n";

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
