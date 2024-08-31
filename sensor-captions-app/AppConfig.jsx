import { Howl } from 'howler';

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

const VIDEO_DEFAULT = {
    userId: 'p1',
    bendType: 'l-bend',
    trial: 't2',
    captions: [],
    activated_captions: [],
    source: {
        url: null,
        type: null
    }, 
    airdata: null
};

const VTT_TYPES = ['light', 'synth', 'bloom', 'meter', 'vibration'];

// LIBRARY OF VIBRATION PATTERNS
const VIBRATION_PATTERNS = [
    { command: 'shortPulse', label: 'Vibrate: Short Pulse', pattern: [200, 100, 200] },
    {command: 'longPulse', label: 'Vibrate: Long Pulse', pattern: [500, 200, 500, 200, 500] },
    {command: 'longDuration',  label: 'Vibrate: Long Duration', pattern: [1000, 500, 1000] },
    {command: 'rapidPulse', label: 'Vibrate: Rapid Pulse', pattern: [50, 30, 50, 30, 50, 30] },
    {command: 'stop', label: 'Stop Vibration', pattern: 0 }
];

const KITCHEN_SOUND_EFFECTS = [
    { id: 0, command: 'lightBoiling', label: 'Sound: Light Boiling', sound: new Howl({ src: ['/sounds/light_boiling.wav'], loop: false }) },
    { id: 1, command: 'bubbling', label: 'Sound: Bubbling', sound: new Howl({ src: ['/sounds/bubbling.wav'], loop: false }) },
    { id: 2, command: 'bubblingIntense', label: 'Sound: Bubbling Intense', sound: new Howl({ src: ['/sounds/bubbling_intense.wav'], loop: false }) },
    { id: 3, command: 'deepFry', label: 'Sound: Deep Fry', sound: new Howl({ src: ['/sounds/deep_fry.wav'], loop: false }) },
    { id: 4, command: 'stoveOn', label: 'Sound: Stove On', sound: new Howl({ src: ['/sounds/stove_on.mp3'], loop: false }) },
    { id: 5, command: 'bell', label: 'Sound: Bell', sound: new Howl({ src: ['/sounds/bell.wav'], loop: false }) },
  ];

  
export {VIDEO_DEFAULT, VTT_TYPES, WEBSOCKET_URL, API_COMMAND_TEMPLATE, VIBRATION_PATTERNS, KITCHEN_SOUND_EFFECTS};