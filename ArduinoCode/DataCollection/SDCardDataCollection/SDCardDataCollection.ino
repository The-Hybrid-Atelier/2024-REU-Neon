
/****************************************************************
 * SDCardDataCollection.ino
 * Part of the Hybrid Atelier 2024 REU
 * Authors: Lejun Liao & Rohita Konjeti
 * Adapted From: Owen Lyke @ SparkFun Electronics
 * Created: 5/30/2024
 *
 * https://github.com/liaolc/2024REUNeon 
 * 
 * User Guide:
 * Click button once to start recording 
 *    First button press of session creates a new Directory 
 *    Otherwise, create and write to new log file
 * Click button again to pause
 * Double click button to end recording
 ***************************************************************/

/** IMU **/
#include "ICM_20948.h" // Click here to get the library: http://librarymanager/All#SparkFun_ICM_20948_IMU

//#define USE_SPI       // Uncomment this to use SPI

#define SERIAL_PORT Serial

//#define SPI_PORT SPI // Your desired SPI port.       Used only when "USE_SPI" is defined
#define CS_PIN 2     // Which pin you connect CS to. Used only when "USE_SPI" is defined

#define WIRE_PORT Wire // Your desired Wire port.      Used when "USE_SPI" is not defined
// The value of the last bit of the I2C address.
// On the SparkFun 9DoF IMU breakout the default is 1, and when the ADR jumper is closed the value becomes 0
#define AD0_VAL 1

ICM_20948_I2C myICM; // Otherwise create an ICM_20948_I2C object

/** BUTTON **/
#include <SparkFun_Qwiic_Button.h>
QwiicButton button;

/** OpenLog **/
#include "SparkFun_Qwiic_OpenLog_Arduino_Library.h"
OpenLog myLog; //Create instance

/** MicroPressusre **/
#include <SparkFun_MicroPressure.h>
SparkFun_MicroPressure mpr;

#define ON 1
#define PAUSE 2
#define OFF 0
#define LOG_INTERVAL 250 //miliseconds between logging data
String nextFileName = "Test0";

void setup()
{
  SERIAL_PORT.begin(115200);
  
  while (!SERIAL_PORT)
  {
  };
  delay(2000);

  WIRE_PORT.begin();
  WIRE_PORT.setClock(400000);

  bool initialized = false;
  while (!initialized)
  {
    myICM.begin(WIRE_PORT, AD0_VAL);
    SERIAL_PORT.print(F("Initialization of the sensor returned: "));
    SERIAL_PORT.println(myICM.statusString());
    if (myICM.status != ICM_20948_Stat_Ok)
    {
      SERIAL_PORT.println("Trying again...");
      delay(500);
    }
    else
    {
      initialized = true;
    }
  }

  /** BUTTON INITIALIZATION **/
  if (button.begin() == false) {
    SERIAL_PORT.println("Device did not acknowledge button");
    while (1);
  }
  SERIAL_PORT.println("Button acknowledged");
  while(!button.isPressedQueueEmpty()){
    button.popPressedQueue();
  }

  pinMode(LED_BUILTIN, OUTPUT);
  
  /** OpenLog Initialization **/
  myLog.begin();
  SERIAL_PORT.println("OpenLog initialized");
  myLog.println("OpenLog initialized for Sensor_Pipeline.ino");
  myLog.syncFile();
  
  /** MicroPressure Initialization **/
  if(!mpr.begin()) {
    SERIAL_PORT.println("Can't connect to MicroPressure Sensor");
    while(1);
  } else {
    SERIAL_PORT.println("MicroPressure Sensor Connected");
  }
}

String fileName = "";
unsigned long init_time = millis();
int startFlag = 0; // 0 = Stopped, 1 = Data collection active, 2 = paused
int status = 0;

void closeLogFile() {
  myLog.syncFile();
  delay(100); // Allow time for file operations to complete
}

void loop()
{
  unsigned long lastClickTime = button.timeSinceLastClick();
  /** Button Handling **/
  if (button.isPressed() == true) {
    SERIAL_PORT.println("Button is pressed");

    /** Single Button Press **/
    if(lastClickTime > 150) { //if single press: start collect if not yet started
      
      /** If off, start collecting data **/
      if(startFlag == OFF) {
        startFlag = ON;
        
        /** File Name Creation **/
        fileName = nextFileName + ".txt";
        myLog.begin();
        myLog.create(fileName);
        myLog.syncFile();
        myLog.append(fileName);
        myLog.print(fileName);
        myLog.println(" File Created");
        int fileNum = nextFileName.substring(4).toInt() + 1;
        nextFileName = "Test" + String(fileNum);

        /** Initial Write to SD Card **/ 
        SERIAL_PORT.println("First Button click, Data Collection Started");
        myLog.println("IMU Output: Scaled");
        myLog.println("Acc (mg) X, Y, Z, Gyr (DPS) X, Y, Z, Mag (uT) X, Y, Z, Temp, Pa, PSI, atm");
        myLog.syncFile();
  
      } else if (startFlag == ON) { 
        SERIAL_PORT.println("Single button click acknowledged, data collection ENDED.");
        myLog.append(fileName);
        myLog.print(millis());
        myLog.print(" Single button click acknowledged, data collection ENDED for file: ");
        myLog.println(fileName);
        myLog.syncFile();
        closeLogFile(); // Close the log file 
        startFlag = OFF;
      }
    }

    /** Button Debouncing **/
    while (button.isPressed()) {
      delay(10);
    }
  } 

  if(startFlag == ON) {
    digitalWrite(LED_BUILTIN, HIGH);
    
    if (myICM.dataReady()) {
      if (millis() - init_time > LOG_INTERVAL) { 
        myICM.getAGMT();
        printScaledAGMT(&myICM);
        myLog.print(millis());
        myLog.print(" ");
        writeScaledAGMT(&myICM);
        myLog.syncFile();
        init_time = millis(); 
      }
    } else {
      if (millis() - init_time > 500) {
        SERIAL_PORT.println("Waiting for data");
        init_time = millis();
      }
    }
  } else if (startFlag == PAUSE) { 
    if (millis() - init_time > 1000) {
      status = !status;
      digitalWrite(LED_BUILTIN, status);
      init_time = millis();
    }
  } else {
    digitalWrite(LED_BUILTIN, LOW);
  }
}

// Below here are some helper functions to print the data nicely!

void printPaddedInt16b(int16_t val)
{
  if (val > 0)
  {
    SERIAL_PORT.print(" ");
    if (val < 10000)
    {
      SERIAL_PORT.print("0");
    }
    if (val < 1000)
    {
      SERIAL_PORT.print("0");
    }
    if (val < 100)
    {
      SERIAL_PORT.print("0");
    }
    if (val < 10)
    {
      SERIAL_PORT.print("0");
    }
  }
  else
  {
    SERIAL_PORT.print("-");
    if (abs(val) < 10000)
    {
      SERIAL_PORT.print("0");
    }
    if (abs(val) < 1000)
    {
      SERIAL_PORT.print("0");
    }
    if (abs(val) < 100)
    {
      SERIAL_PORT.print("0");
    }
    if (abs(val) < 10)
    {
      SERIAL_PORT.print("0");
    }
  }
  SERIAL_PORT.print(abs(val));
}

void printRawAGMT(ICM_20948_AGMT_t agmt)
{
  SERIAL_PORT.print("RAW. Acc [ ");
  printPaddedInt16b(agmt.acc.axes.x);
  SERIAL_PORT.print(", ");
  printPaddedInt16b(agmt.acc.axes.y);
  SERIAL_PORT.print(", ");
  printPaddedInt16b(agmt.acc.axes.z);
  SERIAL_PORT.print(" ], Gyr [ ");
  printPaddedInt16b(agmt.gyr.axes.x);
  SERIAL_PORT.print(", ");
  printPaddedInt16b(agmt.gyr.axes.y);
  SERIAL_PORT.print(", ");
  printPaddedInt16b(agmt.gyr.axes.z);
  SERIAL_PORT.print(" ], Mag [ ");
  printPaddedInt16b(agmt.mag.axes.x);
  SERIAL_PORT.print(", ");
  printPaddedInt16b(agmt.mag.axes.y);
  SERIAL_PORT.print(", ");
  printPaddedInt16b(agmt.mag.axes.z);
  SERIAL_PORT.print(" ], Tmp [ ");
  printPaddedInt16b(agmt.tmp.val);
  SERIAL_PORT.print(" ]");
  SERIAL_PORT.println();
}

void printFormattedFloat(float val, uint8_t leading, uint8_t decimals)
{
  float aval = abs(val);
  if (val < 0)
  {
    SERIAL_PORT.print("-");
  }
  else
  {
    SERIAL_PORT.print(" ");
  }
  for (uint8_t indi = 0; indi < leading; indi++)
  {
    uint32_t tenpow = 0;
    if (indi < (leading - 1))
    {
      tenpow = 1;
    }
    for (uint8_t c = 0; c < (leading - 1 - indi); c++)
    {
      tenpow *= 10;
    }
    if (aval < tenpow)
    {
      SERIAL_PORT.print("0");
    }
    else
    {
      break;
    }
  }
  if (val < 0)
  {
    SERIAL_PORT.print(-val, decimals);
  }
  else
  {
    SERIAL_PORT.print(val, decimals);
  }
}

void printScaledAGMT(ICM_20948_I2C *sensor)
{
  SERIAL_PORT.print("Scaled. Acc (mg) [ ");
  printFormattedFloat(sensor->accX(), 5, 2);
  SERIAL_PORT.print(", ");
  printFormattedFloat(sensor->accY(), 5, 2);
  SERIAL_PORT.print(", ");
  printFormattedFloat(sensor->accZ(), 5, 2);
  SERIAL_PORT.print(" ], Gyr (DPS) [ ");
  printFormattedFloat(sensor->gyrX(), 5, 2);
  SERIAL_PORT.print(", ");
  printFormattedFloat(sensor->gyrY(), 5, 2);
  SERIAL_PORT.print(", ");
  printFormattedFloat(sensor->gyrZ(), 5, 2);
  SERIAL_PORT.print(" ], Mag (uT) [ ");
  printFormattedFloat(sensor->magX(), 5, 2);
  SERIAL_PORT.print(", ");
  printFormattedFloat(sensor->magY(), 5, 2);
  SERIAL_PORT.print(", ");
  printFormattedFloat(sensor->magZ(), 5, 2);
  SERIAL_PORT.print(" ], Tmp (C) [ ");
  printFormattedFloat(sensor->temp(), 5, 2);
  SERIAL_PORT.print(" ]");
  SERIAL_PORT.println();
}

void writeFormattedFloat(float val, uint8_t leading, uint8_t decimals)
{
  float aval = abs(val);
  if (val < 0)
  {
    myLog.print("-");
  }
  else
  {
    myLog.print(" ");
  }
  for (uint8_t indi = 0; indi < leading; indi++)
  {
    uint32_t tenpow = 0;
    if (indi < (leading - 1))
    {
      tenpow = 1;
    }
    for (uint8_t c = 0; c < (leading - 1 - indi); c++)
    {
      tenpow *= 10;
    }
    if (aval < tenpow)
    {
      myLog.print("0");
    }
    else
    {
      break;
    }
  }
  if (val < 0)
  {
    myLog.print(-val, decimals);
  }
  else
  {
    myLog.print(val, decimals);
  }
}

void writePressure() {
  myLog.print(mpr.readPressure(PA));
  myLog.print(",");
  myLog.print(mpr.readPressure());
  myLog.print(",");
  myLog.print(mpr.readPressure(ATM));
}

void writeScaledAGMT(ICM_20948_I2C *sensor)
{
  writeFormattedFloat(sensor->accX(), 5, 2);
  myLog.print(",");
  writeFormattedFloat(sensor->accY(), 5, 2);
  myLog.print(",");
  writeFormattedFloat(sensor->accZ(), 5, 2);
  myLog.print(",");
  writeFormattedFloat(sensor->gyrX(), 5, 2);
  myLog.print(",");
  writeFormattedFloat(sensor->gyrY(), 5, 2);
  myLog.print(",");
  writeFormattedFloat(sensor->gyrZ(), 5, 2);
  myLog.print(",");
  writeFormattedFloat(sensor->magX(), 5, 2);
  myLog.print(",");
  writeFormattedFloat(sensor->magY(), 5, 2);
  myLog.print(",");
  writeFormattedFloat(sensor->magZ(), 5, 2);
  myLog.print(",");
  writeFormattedFloat(sensor->temp(), 5, 2);
  myLog.print(",");
  writePressure();
  myLog.println();
}
