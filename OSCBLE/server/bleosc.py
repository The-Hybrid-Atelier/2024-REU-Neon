import asyncio
from bleak import BleakClient, BleakScanner
from pythonosc.parsing import osc_types


class BLEOSC:
    def __init__(self, config, command_prompt="Type OSC commands (e.g. '/thing/start', '/thing/end', or 'quit'):"):
        self.device_name = config["device_name"]
        self.client = None
        self.buffer = bytearray()  # Initialize the buffer to hold incoming data
        self.command_prompt = command_prompt  # Set the prompt for user input
        # Assigning UUIDs to instance variables
        self.CHARACTERISTIC_UUID_RX = config["CHARACTERISTIC_UUID_RX"]
        self.CHARACTERISTIC_UUID_TX = config["CHARACTERISTIC_UUID_TX"]
        self.input_mode = config["input_mode"]
        self.debug = False  # Set to False to disable debug logging

    async def connect(self, connection_handler=None):
        """
        Connect to the Bluetooth Low Energy device.
        Returns the BleakClient instance once connected.
        """
        print("Scanning for nearby Bluetooth Low Energy devices...")
        devices = await BleakScanner.discover(timeout=10)
        print(f"Scan completed. Found {len(devices)} device(s).")

        address = None
        for device in devices:
            print(f"Found device: {device.name} [{device.address}]")
            if device.name == self.device_name:
                print(f"Device '{device.name}' found at address {device.address}.")
                address = device.address
                break

        if not address:
            print(f"Device '{self.device_name}' not found.")
            self.client = None
            return None

        print(f"Attempting to connect to {self.device_name} ({address})...")
        self.client = BleakClient(address)
        await self.client.connect()
        print(f"Connected to {self.device_name}.")
        if connection_handler:
            await connection_handler()
        await self.client.start_notify(self.CHARACTERISTIC_UUID_TX, self.osc_receive_handler)
         # Start user input in parallel
        if(self.input_mode == "user_input"):
            asyncio.create_task(self.user_input())

    async def send(self, message: str):
        """
        Sends an OSC message via the RX service to the connected BLE device.
        """
        if self.client.is_connected:
            await self.client.write_gatt_char(self.CHARACTERISTIC_UUID_RX, message.encode("utf-8"))
            print(f"Sent: {message}")
        else:
            print("Error: Client is not connected to the BLE device.")

    async def osc_receive_handler(self, sender: int, data: bytearray):
        """
        Handle incoming OSC messages and parse them from the raw byte data.
        """
        # if self.debug:
        #     hex_data = ' '.join([f'{b:02x}' for b in data])
        #     print(f"DEBUG: Raw data received: {hex_data}")
        
        self.buffer += data  # Append incoming data to the buffer
        
        # if self.debug:
        #     buffer_hex = ' '.join([f'{b:02x}' for b in self.buffer])
        #     print(f"DEBUG: Buffer now: {buffer_hex}")
        
        while True:
            try:
                # Check if buffer starts with a slash (OSC address)
                if len(self.buffer) == 0 or self.buffer[0] != 47:  # ASCII '/' is 47
                    # if self.debug and len(self.buffer) > 0:
                    #     print(f"DEBUG: Buffer doesn't start with '/'. Clearing invalid data.")
                    self.buffer = bytearray()
                    break
                
                # Try to extract the OSC address
                address, index = osc_types.get_string(self.buffer, 0)
                
                # Handle special case: messages with no arguments
                # Check if we're at the end of the buffer or the next byte is 0 (null terminator)
                if index >= len(self.buffer) or (index < len(self.buffer) and self.buffer[index] == 0):
                    # if self.debug:
                    #     print(f"DEBUG: Found simple message with no arguments: {address}")
                    
                    # Call handler with the address and empty args list
                    await self.receive_handler(address, [])
                    
                    # Remove the processed message (address + null if present)
                    if index < len(self.buffer) and self.buffer[index] == 0:
                        index += 1
                    self.buffer = self.buffer[index:]
                    continue
                
                # Standard case: message with typetags and possibly arguments
                try:
                    typetags, index = osc_types.get_string(self.buffer, index)
                except osc_types.ParseError:
                    # if self.debug:
                    #     print("DEBUG: Incomplete typetags, waiting for more data")
                    break
                
                args = []
                
                # Parse arguments based on type tags
                for tag in typetags[1:]:  # skip leading comma
                    try:
                        if tag == 'i':
                            arg, index = osc_types.get_int(self.buffer, index)
                            args.append(arg)
                        elif tag == 'f':
                            arg, index = osc_types.get_float(self.buffer, index)
                            args.append(arg)
                        elif tag == 's':
                            arg, index = osc_types.get_string(self.buffer, index)
                            args.append(arg)
                        else:
                            print(f"Unsupported OSC tag: {tag}")
                    except osc_types.ParseError:
                        # if self.debug:
                        #     print(f"DEBUG: Not enough data for tag {tag}")
                        # Not enough data for this argument, wait for more
                        return

                # Build a string for logging (useful for debugging)
                msg_str = address
                if args:
                    msg_str += "," + ",".join(map(str, args))
                # if self.debug:
                #     print(f"DEBUG: Complete message parsed: {msg_str}")

                # Send to handler
                await self.receive_handler(address, args)

                # Remove the parsed OSC packet bytes from 'buffer'
                self.buffer = self.buffer[index:]

                # If there's nothing left to parse, break
                if not self.buffer:
                    break

            except osc_types.ParseError as e:
                # if self.debug:
                #     print(f"DEBUG: Parse error: {e}, waiting for more data")
                # Not enough bytes left for another full OSC message
                break
            except Exception as e:
                print(f"Error processing OSC data: {e}")
                # Prevent getting stuck on corrupt data
                self.buffer = bytearray()
                break

    async def receive_handler(self, address: str, args: list):
        """
        Default handler for incoming messages. Prints the message.
        This handler is called with already parsed OSC message (address and args).
        """
        # Print the received message
        print(f"Received: {address} with args: {args}")

    async def user_input(self):
        """
        Optional: let user type commands like '/yarn/start' or '/yarn/end'.
        Arduino code sees these, toggles record, and sends /mongo/start or /mongo/end back.
        """
        print(self.command_prompt)
        while True:
            cmd = input(">>> ").strip()
            if not cmd:
                continue
            if cmd.lower() == "quit":
                print("Exiting user input task.")
                return
            # Send the command via the send function
            await self.send(cmd)


# Function for the receiver (default behavior)
async def main_receiver(config, osc_device_class=BLEOSC):
    # Instantiate the BLEOSC object with the desired device name
    osc_device = osc_device_class(config)
    
    # Connect to the BLE device
    await osc_device.connect()

    # Keep the application running to listen for incoming messages
    while True:
        await asyncio.sleep(1)  # Keep the event loop running