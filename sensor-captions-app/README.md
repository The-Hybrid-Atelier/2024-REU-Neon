
### README by Roy

## To install libraries:
```bash
npm install
```

## To run:
**To run localhost.../neon** where the websocket and 90% of the work is, you must **run locally** otherwise github Codespaces won't let you open it since it doesn't use a secure websocket. (Run locally as in clone the repo, use command line etc.)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Code Explanation

### /sensor-captions-app/app/neon
Is where all of the websocket work is. Everything on the home page is deprecated and doesn't have any connection to the hardware prototypes, captions, feedback etc. Everything in just /app is pretty much not used. 

  ### Current setup:
  **page.js** holds the page elements itself. It holds custom elements **ConfigProvider** from utils/Config.js, **VideoJS** from ./VideoJs.js, **HowlerPlayer** from ./HowlerPlayer.js. 

  **ConfigProvider** enables the checkboxes and allows the states of the boxes to be passed between objects. 

  **VideoJS** is sadly where most of the logic lies. If someone has time, we should rewrite and move everything back to be OOP designed again. VideoJS parses the caption in handleCueChange(), handles checkbox state changes, handles the button to begin live data collection & live feedback (practice mode), holds and handles the video itself & settings, calls HowlerPlayer for kitchen feedback, and more. 

  **HowlerPlayer** plays the Kitchen feedback sounds (and any .mp3 or audio files). Controlled by VideoJS.js. 

  
### /sensor-captions-app/app/utils
  **SynthManager.js** Generates and plays synth sounds. Controlled by VideoJS.js. I tried to store which notes are active so when users pause and replay, the correct notes continue playing, but it's buggy. (Otherwise notes only get activated on cuechange). 

  Current Issue:
  - Sometimes a SynthManager instance is created more than once, and the old one can't be accessed or turned off. Requires a page refresh, very annoying. Especially bad when video buffers. 

  **websocket.js** passes a JSON containing all settings and commands for the physical sensory feedback devices connected to the ESP32 over hotspot. Requires the ESP32 to be flashed with SensorCaptionWebsocket.ino. 

  **Configs.js** facilitates passing checkbox state between objects. 

### /sensor-captions-app/app/public 
Place any files that need to be accessed on the page here. E.g. images, caption .vtt files, sounds used by HowlerPlayer

### /sensor-captions-app/app/pages
Not used  

