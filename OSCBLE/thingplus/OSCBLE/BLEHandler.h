#ifndef BLE_HANDLER_H
#define BLE_HANDLER_H

#include "config.h"
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include "OSCHandler.h"
#include "MemoryStream.h"



extern BLEServer *pServer;
extern BLECharacteristic *pTxCharacteristic;
extern BLECharacteristic *pRxCharacteristic;
extern bool deviceConnected;
extern bool oldDeviceConnected;

// Function prototypes
void setupBLE();


class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) {
    deviceConnected = true;
  }

  void onDisconnect(BLEServer *pServer) {
    deviceConnected = false;
  }
};

class MyCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    String receivedMessage = pCharacteristic->getValue().c_str();
    OSCMessage oscReceived(receivedMessage.c_str());
    routeOSC(oscReceived);  // Call the function from the main file
  }
};

#endif // BLE_HANDLER_H
