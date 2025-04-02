import argparse
import asyncio
import numpy as np
import json
from bleosc import BLEOSC, main_receiver
from datetime import datetime
from mongo_handler import MongoHandler
from config import yarn_config


mongo = MongoHandler(yarn_config)

class YarnBLEOSC(BLEOSC):
    def __init__(self, config, command_prompt="Type OSC commands (e.g. '/yarn/start', '/yarn/end', or 'quit'):"):
        super().__init__(config, command_prompt)
        self.global_data_buffer = []
        self.recording = False;


    async def receive_handler(self, address: str, args: list):
        """
        Custom receive handler for YarnBLEOSC.
        This replaces the default handler in BLEOSC and directly receives the parsed OSC message.
        """
        # print(f"Yarn-specific handler called for {address} with args: {args}")
        # Handle specific yarn data
        # print(f"DEBUG: Received OSC message: {address} with args: {args}")
        if address == "/yarn/resistance":
            if(self.recording):
                self.process_yarn_resistance(args)
        elif address == "/mongo/start":
            # print("DEBUG: Got /mongo/start command")
            self.start_mongo_recording()
        elif address == "/mongo/end":
            # print("DEBUG: Got /mongo/end command")
            self.end_mongo_recording()

    def process_yarn_resistance(self, data: list):
        """
        Process yarn resistance-specific logic here.
        """
        # print(f"Processing yarn data: {data}")
        # Insert data into the global data buffer
        self.global_data_buffer.append(data)

    def start_mongo_recording(self):
        """
        Handle /mongo/start command
        """
        print("Starting Mongo recording...")
        # Clear the global data buffer to start fresh
        self.global_data_buffer = []
        self.recording = True

    def end_mongo_recording(self):
        """
        Handle /mongo/end command
        """
        print("Ending Mongo recording...")
        # Flatten the global data buffer into a 4xN array-like structure using np.reshape
        flattened_data = self.flatten_data(self.global_data_buffer)
        # Create the JSON object
        data_json = self.create_json_from_data(flattened_data)
        print("Sending data to MongoDB:", data_json)
        self.recording = False;
        print("Data sent to MongoDB successfully.")

    def flatten_data(self, data):
        """
        Flatten the global data buffer into a 4xN array-like structure using np.reshape
        """
        # Flatten the list of data first
        flat_data = np.array(data).flatten()

        # Ensure the data can be reshaped into a 4xN structure
        if len(flat_data) % 4 != 0:
            raise ValueError("Data cannot be reshaped into a 4xN array, length is not divisible by 4.")

        # Reshape to 4xN array
        reshaped_data = flat_data.reshape(-1, 4)
        return reshaped_data

    def create_json_from_data(self, data):
        """
        Convert the data into a JSON object with keys A0, A1, A2, A3.
        """
        # Convert the reshaped data into a list of dictionaries
        data_object = {
            "A0": data[:, 0].tolist(),
            "A1": data[:, 1].tolist(),
            "A2": data[:, 2].tolist(),
            "A3": data[:, 3].tolist()
        }
        record = {
                "name": self.device_name,  # from config.py
                "data": data_object,
                "timestamp": datetime.utcnow()
            }
        mongo.insert_documents([record])
        return json.dumps(data_object)


if __name__ == "__main__":
    
    asyncio.run(main_receiver(yarn_config, YarnBLEOSC))
   