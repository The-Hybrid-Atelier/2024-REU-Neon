import React, { useEffect, useRef, useContext, useState} from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { initWebSocket, getReadings, vibrate, light, collectData, command } from '../utils/websocket';
import { synthManager } from '../utils/SynthManager';
import { ConfigContext } from '../utils/Configs'

const soundMapping = {
  'stoveOn': 'stoveOn',
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
  'bell': 'bell'
};

var jsonObject = {
  device: {
      
  },
  version: "1.0",
  playbackSpeed: 1.0,
  api: {
      command: {
          
      },
      params: {
          
      }
  }
};
var paused = false;
const initJsonObject = () => {
  return {
    device: {
        
    },
    version: "1.0",
    playbackSpeed: 1.0,
    api: {
        command: {
            
        },
        params: {
            
        }
    }
  };
}

let localConfig;

const VideoJS = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady, howlPlayerRef } = props;
  const { config, handleCheckboxChange } = useContext(ConfigContext);
  const [isCollecting, setIsCollecting] = useState(false);

  const handleClick = () => {
    setIsCollecting(prevState => !prevState);
    console.log("localConfig.useLight: " + localConfig.useLight);
    collectData(localConfig.useLight, localConfig.useVibrate);
    if(isCollecting) {
      synthManager.stop();
    }
  };

  const handleCueChange = () => {
    if (howlPlayerRef.current) {
      console.log('playAudio from cuechange triggered');
      const player = playerRef.current;
      const tracks = player.remoteTextTracks();
      const track = tracks[0];
      //onst { config, handleCheckboxChange } = useContext(ConfigContext);

      if (track && track.activeCues && track.activeCues[0]) {
        const capText = track.activeCues[0].text;
        const label = capText.trim().split(': ')[1];
        console.log('Cue label:', label);
        const audioLabel = soundMapping[label];
        console.log('Playing sound:', audioLabel);
        console.log(localConfig);

        if (audioLabel && localConfig.useKitchen) {
          // see if the sound should loop or not
          if (label === '0' || label === '1' || label === '2' || label === '3' || label === '4' || label === '5' || label === '6') {
            howlPlayerRef.current.loop(audioLabel);
          } else {
            howlPlayerRef.current.play(audioLabel);
          }
        } else {
          console.log('Audio label not found or not loaded');
        }
        // Define the regular expression to match "VibrationSpeed" followed by a colon, optional whitespace, and a number
        
        const lightRegex = /LightInten\s*:\s*(\d+)/;
        const nextLightRegex = /NextLightInten\s*:\s*(\d+)/;
        const durationRegex = /Duration\s*:\s*(\d+)/;
        // Use the match method to extract the number
       
        const lightMatch = capText.match(lightRegex);
        const nextLightMatch = capText.match(nextLightRegex);
        const durationMatch = capText.match(durationRegex);
        if (localConfig.useVibrate) {
          jsonObject.device["haptic"] = 1;
          jsonObject.api.command["vibrate"] = 1;
          const vibrationSpeed = vibration[1];
          jsonObject.api.params["intensity"] = Number(lightMatch[1]);
          console.log(`VibrationSpeed: ${lightMatch[1]}`);
        }
        if (lightMatch && localConfig.useSynth) {
          const lightIntensity = lightMatch[1];
          synthManager.playSynth(lightIntensity);
        }
        if (lightMatch && nextLightMatch && durationMatch && localConfig.useLight) {
          const lightIntensity = lightMatch[1];
          const nextLightIntensity = nextLightMatch[1];
          const duration = durationMatch[1];
          console.log(`lightIntensity: ${lightIntensity}`);
          console.log(`nextLightIntensity: ${nextLightIntensity}`);
          jsonObject.device["LED"] = 1;
          jsonObject.api.command["light"] = 1;
          jsonObject.api.params["curr_intensity"] = Number(lightIntensity);
          jsonObject.api.params["next_intensity"] = Number(nextLightIntensity);
          jsonObject.api.params["duration"] = Number(duration);
        } else {
          console.log('light or NextLight intensity not found');
        } 
        command(jsonObject);

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
          jsonObject.api.command["stop"] = Number(1);
          if (localConfig.useSynth) {
            synthManager.pause();
          }
          
          command(jsonObject);
          
        });
        player.on("play", function () {
          jsonObject.api.command["stop"] = Number(0);
          if (localConfig.useSynth) {
            synthManager.resume();
          }
          
          command(jsonObject);
          
        });
        player.on("seeked", function () {
          console.log(track.activeCues);
          
          if (localConfig.useSynth) {
            if (player.paused()) {
              synthManager.pause();
            } else if (track.activeCues === undefined || track.activeCues.length == 0) {
              synthManager.stop();
            }
          }
          
          if(track.activeCues === undefined || track.activeCues.length == 0) {
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

  useEffect (() => {
    console.log("Use effect with config dependency triggered");
    localConfig = config;
    console.log(localConfig);
  },[config]);

  // useEffect (() => {
  //   if(isCollecting) {

  //   }
  // }, [isCollecting]);

  return (
    <div>
      <div>
        <label>
          <input type ="checkbox" name="useSynth" checked={config.useSynth} onChange={handleCheckboxChange}/>
          Synth
        </label>
      </div>
      <div>
        <label>
          <input type ="checkbox" name="useLight" checked={config.useLight} onChange={handleCheckboxChange}/>
          Light Goggles
        </label>
      </div>
      <div>
        <label>
          <input type ="checkbox" name="useVibrate" checked={config.useVibrate} onChange={handleCheckboxChange}/>
          Vibration
        </label>
      </div>
      <div>
        <label>
          <input type ="checkbox" name="useKitchen" checked={config.useKitchen} onChange={handleCheckboxChange}/>
          Kitchen Sounds
        </label>
      </div>
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>
      <div>
        <button onClick={vibrate}>Toggle Vibrate</button>
        <br/>
        <button onClick={handleClick}>
          {isCollecting ? 'Stop Collecting Data' : 'Start Collecting Data'}
        </button>
      </div>
    </div>
    
    
    
  );
};

export default VideoJS;
