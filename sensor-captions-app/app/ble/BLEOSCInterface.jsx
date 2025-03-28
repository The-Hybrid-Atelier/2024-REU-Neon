import React, { useState, useRef } from 'react';
import { Button, Input, Icon, TextArea, Form, Message} from 'semantic-ui-react';

import { readMessage, writeMessage } from 'osc/dist/osc-browser.js';

import { BLE_CONFIG } from '@/AppConfig';

function BLEOSCInterface({ receiverCallback }) {
  const { DEVICE_NAME, UART_SERVICE_UUID, UART_RX_CHARACTERISTIC_UUID, UART_TX_CHARACTERISTIC_UUID } = BLE_CONFIG;
  const [isConnected, setIsConnected] = useState(false);
  const [oscAddress, setOscAddress] = useState('');
  const [oscArgs, setOscArgs] = useState('');
  const [logVisible, setLogVisible] = useState(false);
  const [oscLog, setOscLog] = useState([]);
  const bufferRef = useRef(new Uint8Array(0));
  const txCharRef = useRef(null);
  const [showConfigMessage, setShowConfigMessage] = useState(true);

  const connectBLE = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [UART_SERVICE_UUID] }],
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(UART_SERVICE_UUID);

      const rxCharacteristic = await service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID);
      const txCharacteristic = await service.getCharacteristic(UART_TX_CHARACTERISTIC_UUID);

      txCharRef.current = txCharacteristic;

      await rxCharacteristic.startNotifications();
      rxCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

      setIsConnected(true);
    } catch (error) {
      console.error('BLE Connection Error:', error);
    }
  };

  const handleCharacteristicValueChanged = (event) => {
    const chunk = new Uint8Array(event.target.value.buffer);
    appendToBuffer(chunk);
  };

  const appendToBuffer = (chunk) => {
    const combined = new Uint8Array(bufferRef.current.length + chunk.length);
    combined.set(bufferRef.current);
    combined.set(chunk, bufferRef.current.length);
    bufferRef.current = combined;

    tryParseMessages();
  };

  const tryParseMessages = () => {
    let offset = 0;
    const buffer = bufferRef.current;

    while (offset < buffer.length) {
      try {
        const sliced = buffer.slice(offset);
        const message = readMessage(Buffer.from(sliced));

        if (message && message.address) {
          receiverCallback(message);
          setOscLog((prev) => [...prev, message]);
          offset = buffer.length; // crude: consume all
          break;
        }
      } catch (err) {
        break; // incomplete
      }
    }

    bufferRef.current = buffer.slice(offset);
  };

  const sendOSCMessage = async () => {
    if (!txCharRef.current || !oscAddress.startsWith('/')) return;

    let args = [];
    try {
      if (oscArgs.trim()) {
        args = JSON.parse(oscArgs);
        args = args.map((arg) => {
          const type = typeof arg;
          return { type: type[0], value: arg };
        });
      }
    } catch (err) {
      console.error('Invalid argument format');
      return;
    }

    const msgBuffer = writeMessage({ address: oscAddress, args });
    try {
      await txCharRef.current.writeValue(Uint8Array.from(msgBuffer));
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md w-full max-w-2xl mx-auto mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">BLE OSC Interface</h2>
        <Button color={isConnected ? 'green' : 'blue'} onClick={connectBLE}>
          <Icon name={isConnected ? 'check circle' : 'bluetooth'} />
          {isConnected ? 'Connected' : 'Connect'}
        </Button>
      </div>
      {showConfigMessage && (
        <Message
            info
            onDismiss={() => setShowConfigMessage(false)}
            header="BLE Configuration"
            content={
            <div className="text-left">
                <p><strong>Device Name:</strong> {DEVICE_NAME}</p>
                <p><strong>UART Service UUID:</strong> {UART_SERVICE_UUID}</p>
                <p><strong>RX Characteristic UUID:</strong> {UART_RX_CHARACTERISTIC_UUID}</p>
                <p><strong>TX Characteristic UUID:</strong> {UART_TX_CHARACTERISTIC_UUID}</p>
            </div>
            }
        />
        )}

      <Form>
        <Form.Field>
          <label>OSC Address</label>
          <Input
            placeholder="/osc/address"
            fluid
            value={oscAddress}
            onChange={(e) => setOscAddress(e.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <label>OSC Arguments (JSON Array)</label>
          <TextArea
            placeholder='e.g. [1, "hello", true]'
            value={oscArgs}
            onChange={(e) => setOscArgs(e.target.value)}
          />
        </Form.Field>
        <Button primary onClick={sendOSCMessage} className="mt-2">
          <Icon name="paper plane" />
          Send Message
        </Button>
      </Form>

      <div className="mt-6">
        <Button basic color="grey" onClick={() => setLogVisible(!logVisible)}>
          <Icon name={logVisible ? 'eye slash' : 'eye'} />
          {logVisible ? 'Hide Log' : 'Show Log'}
        </Button>

        {logVisible && (
          <div className="mt-4 p-4 bg-white rounded border max-h-64 overflow-y-scroll text-sm font-mono">
            {oscLog.length === 0 ? (
              <p className="text-gray-500">No messages received yet.</p>
            ) : (
              oscLog.map((msg, idx) => (
                <div key={idx} className="mb-2">
                  <strong>{msg.address}</strong>{' '}
                  {msg.args && msg.args.length > 0 && (
                    <span>- {JSON.stringify(msg.args.map((a) => a.value))}</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BLEOSCInterface;
