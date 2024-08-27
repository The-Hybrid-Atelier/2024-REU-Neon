import React, { useEffect, useRef, useContext, useState} from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { initWebSocket, getReadings, vibrate, light, collectData, command } from '../utils/websocket';
import { synthManager } from '../utils/SynthManager';
import { ConfigContext } from '../utils/Configs'
import { Howl, Howler } from 'howler';  // Ensure Howler is imported
import {Button} from 'semantic-ui-react';
const soundMapping = {
  '-1': 'stoveOn',
  '0': 'lightBoiling',
  '1': 'bubbling',
  '2': 'bubbling',
  '3': 'bubbling',
  '4': 'bubblingIntense',
  '5': 'bubblingIntense',
  '6': 'bubblingIntense',
  '7': 'deepFry',
  '8': 'deepFry',
  '9': 'deepFry',
  '10': 'deepFry',
  '11': 'deepFry',
  '12': 'deepFry',
  '-2': 'bell'
};

var jsonObject = {
  device: {},
  version: "1.0",
  playbackSpeed: 1.0,
  api: {
    command: {},
    params: {}
  }
};

var value = -1;

const initJsonObject = () => {
  return {
    device: {},
    version: "1.0",
    playbackSpeed: 1.0,
    api: {
      command: {},
      params: {}
    }
  };
};

let localConfig;

const VideoJS = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady, howlPlayerRef } = props;
  const { config, handleCheckboxChange } = useContext(ConfigContext);
  const [isCollecting, setIsCollecting] = useState(false);
  const currentSound = useRef(null);  // To keep track of the currently playing sound

  const handleClick = () => {
    setIsCollecting(prevState => !prevState);
    console.log("localConfig.useLight: " + localConfig.useLight);
    collectData(localConfig.useLight, localConfig.useVibrate);
    if(isCollecting) {
      synthManager.stop();
    }
  };

  const stopHowler = () => {
    Howler.stop();
  }
  const stopSynth = () => {
    synthManager.stop();
  }

  const playKitchen = (label) => {
    // see if the sound should loop or not
    console.log('Cue label:', label);
    const audioLabel = soundMapping[label];
    console.log('Playing sound:', audioLabel);
    if (label === '0' || label === '1' || label === '2' || label === '3' || label === '4' || label === '5' || label === '6') {
      howlPlayerRef.current.loop(audioLabel);
    } else {
      howlPlayerRef.current.play(audioLabel);
    }
  };

  const feedback = (val, nextValue, duration) => {
    
    if (localConfig.useKitchen) {
      playKitchen(value);
    } else {
      stopHowler();
    }
    
    if (localConfig.useVibrate) {
      jsonObject.device["haptic"] = 1;
      jsonObject.api.command["vibrate"] = 1;
    
      jsonObject.api.params["intensity"] = Number(value);
      console.log(`VibrationSpeed: ${value}`);
      command(jsonObject);
    } else {
      jsonObject.device["haptic"] = 0;
      jsonObject.api.command["vibrate"] = 0;
      command(jsonObject);
    }
    if (localConfig.useSynth) {
      synthManager.playSynth(value);
    } else {
      synthManager.stop();
    }
    if (duration > 0 && nextValue > 0 && localConfig.useLight) {
      console.log(`lightIntensity: ${value}`);
      console.log(`nextLightIntensity: ${nextValue}`);
      jsonObject.device["LED"] = 1;
      jsonObject.api.command["light"] = 1;
      jsonObject.api.params["curr_intensity"] = value;
      jsonObject.api.params["next_intensity"] = nextValue;
      jsonObject.api.params["duration"] = Number(duration);
      command(jsonObject);
    }
    
  }

  const handleCueChange = () => {
    if (howlPlayerRef.current) {
      console.log('playAudio from cuechange triggered');
      const player = playerRef.current;
      const tracks = player.remoteTextTracks();
      const track = tracks[0];
      
      if (track && track.activeCues && track.activeCues[0]) {
        const capText = track.activeCues[0].text;
        const label = capText.trim().split(': ')[1];
        
        console.log(localConfig);
        // Define the regular expression to match "VibrationSpeed" followed by a colon, optional whitespace, and a number
        const soundRegex = /Sound\s*:\s*(-?\d+)/;

        const nextSoundRegex = /NextSound\s*:\s*(-?\d+)/;
        const durationRegex = /Duration\s*:\s*(\d+)/;
        
        // Use the match method to extract the number
        const soundMatch = capText.match(soundRegex);
        const nextSoundMatch = capText.match(nextSoundRegex);
        const durationMatch = capText.match(durationRegex);
        value = soundMatch ? soundMatch[1] : null;
        // if (value < 0) {
        //   value = 0;
        // }
        if (nextSoundMatch) {
          var nextValue = nextSoundMatch[1];
        }
        if (durationMatch) {
          const duration = durationMatch[1];
          feedback(value, nextValue, duration);
        } else {
          feedback(value);
        }
        
      }
      
    } else {
      console.log('not in current howlPlayerRef, audio not triggered.');
    }
  };

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      console.log("config state:" + config);
      
      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);

        const tracks = player.remoteTextTracks();
        const track = tracks[0];
        if (tracks.length > 0) {
          track.mode = 'showing';
          track.addEventListener('cuechange', handleCueChange);
        }
        player.on("pause", function () {
          jsonObject = initJsonObject();
          jsonObject.api.command["stop"] = Number(1);
          if (localConfig.useSynth) {
            synthManager.pause();
          }
          if (localConfig.useKitchen) {
            Howler.stop();
          }
          
          command(jsonObject);
        });
        player.on("play", function () {
          jsonObject = initJsonObject();
          jsonObject.api.command["stop"] = Number(0);
          jsonObject.api.playbackSpeed = player.playbackRate();
          if (localConfig.useSynth && synthManager.getIsPlaying()) {
            synthManager.resume();
          }
          if (localConfig.useKitchen) {
            playKitchen(value); 
          }
          
          command(jsonObject);
        });
        player.on("seeked", function () {
          console.log(track.activeCues);
          
          if (localConfig.useSynth) {
            if (player.paused()) {
              synthManager.pause();
            } else if (track.activeCues === undefined || track.activeCues.length === 0) {
              synthManager.stop();
            }
          }
          
          if (track.activeCues === undefined || track.activeCues.length === 0) {
            console.log("Video seek, no caption cue active! Pausing all feedback");
            jsonObject = initJsonObject();
            command(jsonObject);
          }
        });
      });
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
    const websocket = initWebSocket();
    websocket.onmessage = (event) => {
      console.log(isCollecting);
      if(!isCollecting) {
        
        const msg = JSON.parse(event.data);
        if (localConfig.useSynth) {
          console.log("trying to play synth with live data");
          synthManager.playSynth(msg["val"]);
        }
      }
    };
    getReadings();

    return () => {
      const player = playerRef.current;
      if (player) {
        const tracks = player.remoteTextTracks();
        if (tracks.length > 0) {
          const track = tracks[0];
          if (track) {
            track.removeEventListener('cuechange', handleCueChange);
          }
        }
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [options, videoRef]);

  useEffect(() => {
    console.log("Use effect with config dependency triggered");
    localConfig = config;
    console.log(localConfig);
    feedback(value);

  }, [config]);

  return (
    <div>
      <div>
        <label>
          <input type="checkbox" name="useSynth" checked={config.useSynth} onChange={handleCheckboxChange} />
          Synth
        </label>
      </div>
      <div>
        <label>
          <input type="checkbox" name="useLight" checked={config.useLight} onChange={handleCheckboxChange} />
          Light Goggles
        </label>
      </div>
      <div>
        <label>
          <input type="checkbox" name="useVibrate" checked={config.useVibrate} onChange={handleCheckboxChange} />
          Vibration
        </label>
      </div>
      <div>
        <label>
          <input type="checkbox" name="useKitchen" checked={config.useKitchen} onChange={handleCheckboxChange} />
          Kitchen Sounds
        </label>
      </div>
      <div>
        <h2>DEBUG AREA</h2>
        <Button onClick={stopHowler}>Stop Howler</Button>
        <Button onClick={stopSynth}>Stop Synth</Button>
      </div>
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>
      <div>
        <Button onClick={vibrate}>Toggle Vibrate</Button>
        <br />
        <Button onClick={handleClick}>
          {isCollecting ? 'STOP LIVE' : 'START LIVE'}
        </Button>
        <div style={{ marginTop: '15px', textAlign: 'left' }}>
          <h3>Expert Graph</h3>
          <img src="bend1expert.png" alt="Expert Graph" style={{ maxWidth: '75%', height: 'auto' }} />
        </div>
      </div>
      
    </div>
  );
};

export default VideoJS;

