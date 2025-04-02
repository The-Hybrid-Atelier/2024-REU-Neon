#include "BLEHandler.h"
#include "OSCHandler.h"  // Include the OSC handler functions

// Global variables
BLEServer *pServer = NULL;
BLECharacteristic *pTxCharacteristic;
BLECharacteristic *pRxCharacteristic;
bool deviceConnected = false;
bool oldDeviceConnected = false;

void setupBLE() {
    Serial.print("Initializing ");
    Serial.println(DEVICE_NAME);

    // Initialize BLE with an empty name (we'll set the name in advertising)
    BLEDevice::init(DEVICE_NAME);

    // Get advertising object
    BLEAdvertising *pAdvertising = pServer->getAdvertising();

    // Create a BLEAdvertisementData object and set the device name
    BLEAdvertisementData advertisementData;
    advertisementData.setName(DEVICE_NAME);  // Set the device name here

    // Set the scan response data with the device name
    pAdvertising->setScanResponseData(advertisementData);

    // Create the BLE server
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());

    // Create BLE service
    BLEService *pService = pServer->createService(SERVICE_UUID);

    // Set up TX and RX characteristics
    pTxCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_TX, BLECharacteristic::PROPERTY_NOTIFY);
    pTxCharacteristic->addDescriptor(new BLE2902());

    pRxCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_RX, BLECharacteristic::PROPERTY_WRITE);
    pRxCharacteristic->setCallbacks(new MyCallbacks());

    // Start the service
    pService->start();

    // Stop any ongoing advertising to update the name
    pAdvertising->stop();
    
    delay(500);  // Delay to ensure the stop command is processed

    // Start advertising with the updated name
    pAdvertising->start();
    
    Serial.println("Waiting for a client to connect...");
}
