import argparse
import asyncio
import numpy as np
import json
import websockets
from bleosc import BLEOSC, main_receiver
from datetime import datetime
from mongo_handler import MongoHandler
from config import neon_config

# Global WebSocket variable
websocket = None
ble_device = None
mongo = MongoHandler(neon_config)


WEBSOCKET_SERVER = "wss://haws.cearto.com/ws/"
RATE = 50  # ms


async def websocket_handler():
    """ Maintains a persistent WebSocket connection. """
    global websocket
    while True:
        try:
            async with websockets.connect(WEBSOCKET_SERVER) as ws:
                websocket = ws
                print("Connected to WebSocket")
                
                # Send the initial greeting message
                greeting_message = {
                    "event": "greeting",
                    "name": "osc-neon-thing-forwarder"
                }
                await websocket.send(json.dumps(greeting_message))
                print("Sent greeting message:", greeting_message)

                # Listen for incoming WebSocket messages
                async for message in ws:
                    await handle_incoming_message(message)

                # Keep the WebSocket connection alive
                await ws.wait_closed()
        except Exception as e:
            print(f"WebSocket error: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)

async def handle_incoming_message(message):
    """ Handle incoming WebSocket message and act on 'change_rate' command. """
    global ble_device
    try:
        message_data = json.loads(message)  # Parse the message into JSON
        
        # Check if the message matches the expected format
        if message_data.get("api") == "start":
            await ble_device.send(f"/neon/start") 
        elif message_data.get("api") == "stop":
            await ble_device.send(f"/neon/stop")    
        elif message_data.get("api") == "change_rate" and "params" in message_data:
            rate = message_data["params"].get("rate")
            if rate:
                print(f"Received change_rate command. Changing rate to: {rate} ms")
                # Update RATE globally and send the command to change the rate
                global RATE
                RATE = rate
                await ble_device.send(f"/neon/rate {RATE}")  # Send the rate change command to the WebSocket server
        else:
            print(f"{message} not processed.")
    except Exception as e:
        print(f"Error handling incoming message: {e}")

async def websocket_send(message):
    """ Sends data through an open WebSocket connection. """
    global websocket
    try:
        # Check if WebSocket is open using the state property
        if websocket is not None and websocket.state == websockets.protocol.State.OPEN:
            await websocket.send(message)
            print(f"Sent to WebSocket: {message}")
        else:
            print("WebSocket is not connected or closed. Retrying...")
            await asyncio.sleep(1)
            await websocket_send(message)  # Retry sending the message
    except Exception as e:
        print(f"Error sending WebSocket message: {e}. Retrying...")
        await asyncio.sleep(1)
        await websocket_send(message)  # Retry sending the message

class NeonBLEOSC(BLEOSC):
    def __init__(self, device_name, command_prompt="Type OSC commands (e.g. '/neon/start', '/neon/stop', or 'quit'):"):
        super().__init__(device_name, command_prompt)
        self.global_data_buffer = []
        self.recording = False

    async def receive_handler(self, address: str, args: list):
        """
        Custom receive handler for YarnBLEOSC.
        This replaces the default handler in BLEOSC and directly receives the parsed OSC message.
        """
        print(f"Neon-specific handler called for {address} with args: {args}")
        # Handle specific yarn data
        if address == "/neon/pressure":
            if(self.recording):
                self.process_neon_pressure(args)
        elif address == "/mongo/start":
            await self.start_mongo_recording()
        elif address == "/mongo/save":
            self.save_mongo_recording()

    def process_neon_pressure(self, data: list):
        """
        Process neon pressure-specific logic here and send data to WebSocket.
        """
        print(f"Processing neon data: {data}")
        # Insert data into the global data buffer
        self.global_data_buffer.append(data)
        
        # Send data to the WebSocket server
        asyncio.create_task(self.send_data_to_websocket({
            "event": "read-pressure",
            "data": data
        }))

    async def send_data_to_websocket(self, message: dict):
        """
        Ensure WebSocket is connected before sending data.
        """
        json_message = json.dumps(message)
        await websocket_send(json_message)  # Send the message to the WebSocket

    async def start_mongo_recording(self):
        """
        Handle /mongo/start command
        """
        print("Starting Mongo recording...")
        await self.send(f"/neon/rate {RATE}")
        # Clear the global data buffer to start fresh
        self.global_data_buffer = []
        self.recording = True

    def save_mongo_recording(self):
        """
        Handle /mongo/save command
        """
        print("Ending Mongo recording...")
        try:
            # Ensure the data in the buffer is a 2D array or compatible shape
            if self.global_data_buffer:
                # Flatten the global data buffer into a 1D array
                flattened_data = np.array(self.global_data_buffer, dtype=float).flatten().tolist() 
                # You could use np.concatenate if you need to handle individual arrays differently
                data_json = self.create_json_from_data(flattened_data)
                print("Sending data to MongoDB:", data_json)
                self.global_data_buffer = None
            else:
                print("Error: No data to record.")
        except Exception as e:
            print(f"Error processing data: {e}")
        finally:
            self.recording = False

    def create_json_from_data(self, data):
        record = {
                "name": self.device_name,  # from config.py
                "data": data,
                "timestamp": datetime.utcnow(), 
                "unit": "Pa"
            }
        mongo.insert_documents([record])
        return json.dumps(data)
async def connection_handler():
    msg = {"event": "ble-connected"}
    await websocket_send(json.dumps(msg))
# Function for the receiver (default behavior)
async def main_ble():
    global ble_device
    # Instantiate the BLEOSC object with the desired device name
    ble_device = NeonBLEOSC(neon_config)
    
    # Connect to the BLE device
    await ble_device.connect(connection_handler)

    # Keep the application running to listen for incoming messages
    while True:
        await asyncio.sleep(1)  # Keep the event loop running

async def main():
    # Create tasks for WebSocket connection and OSC receiver
    websocket_task = asyncio.create_task(websocket_handler())  # Start WebSocket connection handler
    osc_task = asyncio.create_task(main_ble())  # Start OSC receiver

    # Wait for both tasks to complete
    await asyncio.gather(websocket_task, osc_task)

if __name__ == "__main__":
    asyncio.run(main())
