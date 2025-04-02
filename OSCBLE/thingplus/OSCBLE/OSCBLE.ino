#include "config.h"  // Include the config file for BLE definitions
#include <Arduino.h>
#include "MemoryStream.h"
#include "BLEHandler.h"
#include "OSCHandler.h"  // Include the OSC handler functions


#define LED_PIN     13  // Built-in LED
#define BUTTON_PIN  0   // Built-in pushbutton -- NOT RESET  
#define RESISTANCE(sensorValue) (R_known * ((5.0 - (((sensorValue) / 1023.0) *5.0)) / (((sensorValue) / 1023.0) * 5.0)))

char buffer[255];
bool record = false;

const float R_known = 10000.0;  // Known resistor (10kΩ in this example)

void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    pinMode(BUTTON_PIN, INPUT_PULLUP); 
    pinMode(A0, INPUT_PULLUP);
    pinMode(A1, INPUT_PULLUP);
    pinMode(A2, INPUT_PULLUP);
    pinMode(A3, INPUT_PULLUP);
    pinMode(A4, INPUT_PULLUP);
    digitalWrite(LED_PIN, LOW); 
    setupBLE();  // Initialize BLE
}

void sampleYarns(){
  int args[] = {RESISTANCE(analogRead(A0)), RESISTANCE(analogRead(A1)), RESISTANCE(analogRead(A2)), RESISTANCE(analogRead(A3))};
  sendOSC("/yarn/resistance", args, 4);
}

// RECEIVE
// void processMessage(){
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

  if (msg.match("/yarn/start")) {
    Serial.println("Start signal received.");
    sendSimpleOSC("/mongo/start");
    record = true;
  } 
  else if (msg.match("/yarn/end")) {
    Serial.println("End signal received.");
    sendSimpleOSC("/mongo/end");
    record = false;
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
          OSCMessage msg("/yarn/end");
          routeOSC(msg);
          // Skip sampling this iteration to avoid mixing messages.
          return;
        } else{
          OSCMessage msg("/yarn/start");
          routeOSC(msg);
          return;
        }
    }
    if (digitalRead(BUTTON_PIN) == HIGH) {
        buttonPressed = false;
    }
    
    // Only sample sensor data if recording is active.
    if(record){
      sampleYarns();
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