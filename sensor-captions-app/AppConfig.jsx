import { Howl } from 'howler';
import { faWaveSquare} from '@fortawesome/free-solid-svg-icons';
import { faGlasses, faMobileScreenButton } from '@fortawesome/free-solid-svg-icons';
import { faHand as faRegularHand } from '@fortawesome/free-regular-svg-icons';
import { faLightbulb as faRegularLightbulb } from '@fortawesome/free-regular-svg-icons'; // Regular lightbulb
import { faMusic } from '@fortawesome/free-solid-svg-icons'; // Solid music
import { faFireBurner } from '@fortawesome/free-solid-svg-icons'; // Solid fire burner
import { faPhoneVolume } from '@fortawesome/free-solid-svg-icons'; // Solid phone volume
import { faThinkPeaks } from '@fortawesome/free-brands-svg-icons'; // Think Peaks (Brands)
import { faVideo } from '@fortawesome/free-solid-svg-icons'; // Solid Video

const HAWS_URL = 'wss://haws.cearto.com/ws/'; // HAWS
const WEBSOCKET_URL = HAWS_URL;
const INPUT_MODES = [
    { id: 0, label: 'Video', value: 'video', icon: faVideo },
    { id: 1, label: 'Sensor', value: 'sensor', icon: faWaveSquare },
]
const OUTPUT_DEVICES = [
    {id: 0, label: 'GOGGLE', icon: faGlasses},
    {id: 1, label: 'PHONE', icon: faMobileScreenButton},
    {id: 2, label: 'BRACELET', icon: faRegularHand}
];
const VTT_TYPES = ['light', 'synth', 'sound', 'meter', 'vibration'];


const CAPTION_ICON_MAPPING = {
    'light': faRegularLightbulb,
    'synth': faMusic,
    'sound': faFireBurner,
    'meter': faPhoneVolume,
    'vibration': faRegularHand
};


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
    airdata: null,
    live: false
};


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

  
export {VIDEO_DEFAULT, OUTPUT_DEVICES, CAPTION_ICON_MAPPING,  INPUT_MODES, VTT_TYPES, WEBSOCKET_URL, API_COMMAND_TEMPLATE, VIBRATION_PATTERNS, KITCHEN_SOUND_EFFECTS};