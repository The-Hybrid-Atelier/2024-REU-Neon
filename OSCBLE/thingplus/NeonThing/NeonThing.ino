// Libraries Needed:
// SparkFun_MicroPressure
// OSC (Adrian Freed)
#include "config.h"  // Include the config file for BLE definitions
#include <Arduino.h>
#include "MemoryStream.h"
#include "BLEHandler.h"
#include "OSCHandler.h"  // Include the OSC handler functions
#include "Wire.h"
#include "SparkFun_MicroPressure.h"

#define LED_PIN     13  // Built-in LED
#define BUTTON_PIN  0   // Built-in pushbutton -- NOT RESET  
#define RESISTANCE(sensorValue) (R_known * ((5.0 - (((sensorValue) / 1023.0) *5.0)) / (((sensorValue) / 1023.0) * 5.0)))
#define MIN_RATE 10
#define MAX_RATE 1000


char buffer[255];
bool record = false;

SparkFun_MicroPressure mpr;
const float R_known = 10000.0;  // Known resistor (10kΩ in this example)
float pressure;
int rate = 50; // sampling rate (ms)

void processRate(char* buffer) {
  Serial.print("Received message: ");
  Serial.println(buffer);  // Print the entire message
  
  // Tokenize buffer on space
  char* token = strtok(buffer, " ");
  
  // The first token should be the address (e.g., "/neon/rate")
  if (token != nullptr) {
    Serial.print("Address: ");
    Serial.println(token);  // Print the OSC address (should be "/neon/rate")
    
    // Get the second token, which should be the rate value (e.g., "1000")
    token = strtok(nullptr, " ");
    if (token != nullptr) {
      // Convert the token to an integer
      int incomingRate = atoi(token);  // Convert string to integer
      Serial.print("Rate Argument: ");
      Serial.println(incomingRate);
      
      // Constrain the rate between MIN_RATE and MAX_RATE
      rate = constrain(incomingRate, MIN_RATE, MAX_RATE);
      Serial.print("Constrained rate: ");
      Serial.println(rate);
    }
    else {
      Serial.println("No rate argument found.");
    }
  }
  else {
    Serial.println("No address found in the message.");
  }
}

void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    pinMode(BUTTON_PIN, INPUT_PULLUP); 

    Wire.begin();
    if(!mpr.begin()){
      Serial.println("Cannot connect to air sensor");
      while(1);
    }

    digitalWrite(LED_PIN, LOW); 
    setupBLE();  // Initialize BLE
}

void sampleAir(){
  pressure = mpr.readPressure(PA);
  sendSampleOSC("/neon/pressure", pressure);
  delay(rate);
}

// RECEIVE
// void processMessage(OSCMessage &msg){
//   for (int i = 0; i < msg.size(); i++) {
//       if (msg.isInt(i)) {
//         Serial.print("Air Argument ");
//         Serial.print(i);
//         Serial.print(": ");
//         Serial.println(msg.getInt(i));
//       } 
//       else if (msg.isFloat(i)) {
//         Serial.print("Air Argument ");
//         Serial.print(i);
//         Serial.print(": ");
//         Serial.println(msg.getFloat(i));
//       }
//     }
// }

// Route function to handle specific OSC addresses
void routeOSC(OSCMessage &msg) {
  // Blink LED on receive 
  msg.getAddress(buffer, 0, 255);
  Serial.println(buffer);

  if (msg.match("/neon/start")) {
    record = true;
    Serial.println("Start signal received.");
    sendSimpleOSC("/mongo/start");
  } 
  else if (msg.match("/neon/rate*")) { 
    Serial.println("Rate change received.");
    processRate(buffer);
  }
  else if (msg.match("/neon/stop")) {
    record = false;
    Serial.println("Stop signal received.");
    sendSimpleOSC("/mongo/save");
  }
  else {
    record = false;
    Serial.println("Unrecognized OSC address.");
  }
}


void loop() {
    static bool buttonPressed = false;
    
    // Check button press first and handle it before sampling.
    if (digitalRead(BUTTON_PIN) == LOW && !buttonPressed) {
        buttonPressed = true;
        if(record){
          OSCMessage msg("/neon/stop");
          routeOSC(msg);
          // Skip sampling this iteration to avoid mixing messages.
          return;
        } else{
          OSCMessage msg("/neon/start");
          routeOSC(msg);
          return;
        }
    }
    if (digitalRead(BUTTON_PIN) == HIGH) {
        buttonPressed = false;
    }
    
    // Only sample sensor data if recording is active.
    if(record){
      sampleAir();
    }

    // Update the LED: on when recording, off otherwise.
    digitalWrite(LED_PIN, record ? HIGH : LOW);

    // BLE Advertising: if a device disconnects, start advertising again.
    if (!deviceConnected && oldDeviceConnected) {
        delay(500);
        pServer->startAdvertising();
        Serial.println("Started advertising again");
        oldDeviceConnected = deviceConnected;
    }
    if (deviceConnected && !oldDeviceConnected) {
        oldDeviceConnected = deviceConnected;
    }
}