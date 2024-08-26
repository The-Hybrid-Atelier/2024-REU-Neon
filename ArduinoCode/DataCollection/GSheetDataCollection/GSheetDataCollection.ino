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
#include<Wire.h>
SparkFun_MicroPressure mpr;

// For SD/SD_MMC mounting helper
#include <GS_SDHelper.h>

#define WIFI_SSID "atelier"
#define WIFI_PASSWORD "ERB281282"

// FOR HOTSPOT
// #define WIFI_SSID "RohitaK"
// #define WIFI_PASSWORD "apple123"


#define PROJECT_ID "sensorcaptions"

// Service Account's client email
#define CLIENT_EMAIL "sensorcaptionsesp32@sensorcaptions.iam.gserviceaccount.com"
// Your email to share access to spreadsheet
#define USER_EMAIL "sensorcaptiondata@gmail.com"

char numberArray[20];

// Service Account's private key
  
const char PRIVATE_KEY[] PROGMEM = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDQy8+SeshmKdBR\nPwvxFCiG2G2HpuwCjlZxUWTYl0nujXqcAnxwXaLhEk3og+YXgPfc6vnfJw6ZiMJ8\nRNCdWm/1niBI8RIQtKAnJYKImrQRlzNPM1ND8+5nzgW3xpZgAXs/7oC1yq0hjTFc\nfGdQuyMeYAI5hkVg7iTZyQMaG3CbYtrqH2zTBAoz4oQJ+KnVeyhYwYhollvnduo8\nTTnegQeZejdC+vXu0D1cGpdjGsc64vC5/pGhMKg+J0Akb3zt7xAJ45LYcrArHzfW\n8L1+cNIxG69O3ThF5hn8IrjRViasBl4Be5cCFyQoolqAs2VUAonlIi/e1dNFXri2\npB6VOWzXAgMBAAECggEAXBmy/6WKdUo3ekcpsNdYAxc/xUkTrRL1PXoOVl3xvjkJ\nHv0XwAcFvGszE3/vBGoeq4O44b7cOUxyoZdHQEmuvjTYf+RauCS8ylfI6xH2oRXF\ni8eTkJNuk7p0mjqOhV3R7IL7onT7BqQ95FJ5zkol9RWblZ1NSDLz7V82L5NwChH2\nWr3k7OIhEjqXqlFz5qZW+jPdU8FOzIdjF1ntGjgvnkqAQSrNIdH6+G7KTf75CpOZ\nzI2wsTZOlzXeZdwI7ykn32DRcGAc92GA+xSrEYDzatLgP9mN/StAYCgcWQvAXSH8\nwkrahy9PhkGDpRBuBSscqt9sB8/d99WX1Fdiyy88iQKBgQDx7kDEXfU02IhAEs+L\nhbOME39QBEGUy4Rkd1DEOxLC1RtObyB4EQbpD0ooi7zXceIPb/HQk40kNhU0rJJH\nSy43Hp9vOjobODoI9zVIaVd5IPxP/obbRLRL/8c5F1CFA45bqOvctbnylX7S/6sP\n1WaaFMqpnUYj5oL2LoGnrd0K+QKBgQDc8EROAkWprsHGNXwaAulgHDJuPKTYM6gI\ngGL9PeZJ/NP+D8YfDbdK3YG7V3WtkUmiO2urfs/3woPeTG/rvTQ3g3E5Z8W4/ajO\nrhdeF4nd7uzNXAUACZC44kTnbYt3QkOYIVnEpmrVb9Tab3MBw8LBpUtcuv9+EMvi\niUZrz8PaTwKBgEiek6Jd8bSjKoLRIqtmvrZVQ+no3Sak0GC3z+6XLNJ+1Wt9v+lK\ncyCSDliNWWnyLUElARjysXMlKMhe5Kmxz3WMI59ngvmYrxLx4XSS6kbZt+LrK9+1\nh8koRczFSs4ieyDYW7QseFxws1jylY5zKBEoHI09QEiWcMkkvJZwgeFBAoGAbqZO\nLxtoNCD3nwLuUkCfDKlSgG8Sx8ynHQrfiKDVkrxyl0zjFm5SG8Zv0JlusCyRShSk\nSdFK6nSaglyZuOCbJCpKLEvSdGFlh40c2tzDCUk9g2PQhUJFHrMDezwbmvCu1aPu\nR1RpMNe/LF6gpIOcKEtWQOzORB65XY0OnbQCDHUCgYEAjt2bn9YHGEucs0OFTBak\nDtkKb5T5X/0Bma+fClohEK7zdEx7vVNA4w5eyTF0x5iQvtTBV/KdpRhWV7vsnzrI\niwdB6YiFVHT9Uss7gcf7uqIpjFsMJkLxrZ2GQzPWaHthbQvHJFDlIaKlwDBfIe/L\n7rAeedxbIafTc2NUQ2cD2BQ=\n-----END PRIVATE KEY-----\n";
bool taskComplete = false;

#if defined(ARDUINO_RASPBERRY_PI_PICO_W)
WiFiMulti multi;
#endif

void tokenStatusCallback(TokenInfo info);

void setup() {

  Serial.begin(115200);
  Wire.begin();
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




