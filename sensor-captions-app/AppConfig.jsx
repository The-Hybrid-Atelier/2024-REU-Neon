const HAWS_URL = 'wss://haws.cearto.com/ws/'; // HAWS
const WEBSOCKET_URL = HAWS_URL;

const API_COMMAND_TEMPLATE = {
    api: {
        command: {
  
        },
        params: {
            
        }
    }
};

// LIBRARY OF VIBRATION PATTERNS
const VIBRATION_PATTERNS = [
    { command: 'shortPulse', label: 'Vibrate: Short Pulse', pattern: [200, 100, 200] },
    {command: 'longPulse', label: 'Vibrate: Long Pulse', pattern: [500, 200, 500, 200, 500] },
    {command: 'longDuration',  label: 'Vibrate: Long Duration', pattern: [1000, 500, 1000] },
    {command: 'rapidPulse', label: 'Vibrate: Rapid Pulse', pattern: [50, 30, 50, 30, 50, 30] },
    {command: 'stop', label: 'Stop Vibration', pattern: 0 }
];

export {WEBSOCKET_URL, API_COMMAND_TEMPLATE, VIBRATION_PATTERNS};