# YARN THING (TP5)
yarn_config = {
    "device": "TP5",
    "device_name": "YarnThing",
    "SERVICE_UUID": "c55cce52-208b-4633-b6de-5757cc8eb0db",  # Custom Service UUID
    "CHARACTERISTIC_UUID_RX": "b720b489-57d8-40a0-8daa-f2fa8e77905d",  # RX Characteristic UUID
    "CHARACTERISTIC_UUID_TX": "2564f64d-87e6-4fb0-a4b6-330efefa9197",  # TX Characteristic UUID,
    "db_name": "yarn",
    "collection_name": "pilot",
    "input_mode": "button_interface"
}

# OSC THING (TP7)
osc_config = {
    "device": "TP7",
    "device_name": "OSCThing",
    "SERVICE_UUID": "71c978dc-2d05-4a35-b56f-12f4fee4ee31",  # UART service UUID
    "CHARACTERISTIC_UUID_RX": "43d4940a-3037-4040-9c3d-6ecd138325ca",  # RX characteristic UUID
    "CHARACTERISTIC_UUID_TX": "78d88040-6306-40bd-b47d-e1feb75d6482",  # TX characteristic UUID
    "db_name": "osc",
    "collection_name": "pilot",
    "input_mode": "button_interface"
}

# NEON THING (TP4)
neon_config = {
    "device": "TP4",
    "device_name": "NeonThing",
    "SERVICE_UUID": "9b47244f-2cde-4158-b0cb-110c034c9ef6",  # Custom Service UUID
    "CHARACTERISTIC_UUID_RX": "ab34a84a-1c95-4124-a058-8afa0fbbb67b",  # RX Characteristic UUID
    "CHARACTERISTIC_UUID_TX": "f2a7b731-aa35-4c2d-b960-5697b7ad218f",  # TX Characteristic UUID
    "db_name": "neon",
    "collection_name": "pilot", 
    "input_mode": "button_interface"
}
