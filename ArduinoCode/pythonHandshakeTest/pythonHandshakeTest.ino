/** MicroPressusre **/
// #include <SparkFun_MicroPressure.h>
// SparkFun_MicroPressure mpr;

// #include <Wire.h>

#define ZERO_CHAR_VAL 48

// const int voltagePin = A0;

const int HANDSHAKE = 0;
const int VOLTAGE_REQUEST = 1;
const int ON_REQUEST = 2;
const int STREAM = 3;
const int READ_DAQ_DELAY = 4;

// Initially, only send data upon request
int daqMode = ON_REQUEST;

// Default time between data acquisition is 100 ms
int daqDelay = 250;

// String to store input of DAQ delay
String daqDelayStr;


// Keep track of last data acquistion for delays
unsigned long timeOfLastDAQ = 0;


// unsigned long printPresssure() {
//   // Read value from analog pin
  
//   float value = mpr.readPressure(PA);
  

//   // Get the time point
//   unsigned long timeMilliseconds = millis();
  

//   // Write the result
//   if (Serial.availableForWrite()) {
//     String outstr = String(String(timeMilliseconds, DEC) + "," + String(value, DEC));
//     Serial.println(outstr);
//   }

//   // Return time of acquisition
//   return timeMilliseconds;
// }


void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  // Wire.begin();
  //mpr.begin();
  pinMode(LED_BUILTIN, OUTPUT);
  // if(mpr.begin()) {
  //   Serial.println("MPR SETUP SUCCESSFUL");
  // }
}


void loop() {
  // Serial.println("IN LOOP");
  // If we're streaming
  // if (daqMode == STREAM) {
  //   if (millis() - timeOfLastDAQ >= daqDelay) {
  //     timeOfLastDAQ = printPresssure();
  //   }
  // }

  // Check if data has been sent to Arduino and respond accordingly
  if (Serial.available() > 0) {
    digitalWrite(LED_BUILTIN, LOW);
    
    // Read in request
    int inByte = Serial.read();
    // if (inByte >= ZERO_CHAR_VAL && daqMode != READ_DAQ_DELAY) {
    //   inByte -= ZERO_CHAR_VAL;
    // }
    // if (daqMode != READ_DAQ_DELAY) {
    //   inByte -= ZERO_CHAR_VAL;
    // }
    // Serial.println(inByte);
    // If data is requested, fetch it and write it, or handshake
    switch(inByte) {
      digitalWrite(LED_BUILTIN, LOW);
      // case VOLTAGE_REQUEST:
      //   timeOfLastDAQ = printPresssure();
      //   break;
      // case ON_REQUEST:
      //   daqMode = ON_REQUEST;
      //   break;
      // case STREAM:
      //   daqMode = STREAM;
      //   break;
      // case READ_DAQ_DELAY:
      //   digitalWrite(LED_BUILTIN, HIGH);
      //   // Read in delay, knowing it is appended with an x
      //   daqDelayStr = Serial.readStringUntil('x');
      //   //Serial.println(daqDelayStr);

      //   // Convert to int and store
      //   daqDelay = daqDelayStr.toInt();
      //   // Serial.println(daqDelay);
        

      //   break;
      case HANDSHAKE:
        
        if (Serial.availableForWrite()) {
          Serial.println("Message received.");
          digitalWrite(LED_BUILTIN, HIGH);
        }
        else {
          digitalWrite(LED_BUILTIN, LOW);
        }
        break;
    }
    
  }
  else {
    digitalWrite(LED_BUILTIN, HIGH);
  }
}