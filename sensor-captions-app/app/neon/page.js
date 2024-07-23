'use client';

import React, { useEffect, useRef, useState } from 'react';
import VideoJS from './VideoJS';
import "videojs-youtube";
import HowlerPlayer from './HowlerPlayer';
import { initWebSocket, getReadings, vibrate, light, collectData, command } from '../utils/websocket';
import next from 'next';

const jsonObject = {
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

const App = () => {
  const howlPlayerRef = useRef(null);
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    const websocket = initWebSocket();
    getReadings();
    
    return () => {
        // if (websocket) {
        //     websocket.close();
        // }
    };
  }, []);

  const videoJsOptions = {
    techOrder: ["youtube"],
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    playbackRates: [0.1, 0.25, 0.5, 1, 1.5, 2],
    sources: [
      {
        src: "https://www.youtube.com/watch?v=wvIOqabJv4k",
        type: "video/youtube",
      },
    ],
  };

  const captionOption = {
    kind: 'captions',
    srclang: 'en',
    label: 'English',
    src: 'MadL_bend1v3.vtt'

  };

  const handleCueChange = () => {
    if (howlPlayerRef.current) {
      console.log('playAudio from cuechange triggered')
      const player = playerRef.current;
      const tracks = player.remoteTextTracks();
      const rate = player.playbackRate();
    
      const track = tracks[0];
      console.log(track);
      if (track.activeCues[0] != null) {
        const capText = track.activeCues[0].text;
        // Define the regular expression to match "VibrationSpeed" followed by a colon, optional whitespace, and a number
        const vibrationRegex = /VibrationSpeed\s*:\s*(\d+)/;
        const lightRegex = /LightInten\s*:\s*(\d+)/;
        const nextLightRegex = /NextLightInten\s*:\s*(\d+)/;
        const durationRegex = /Duration\s*:\s*(\d+)/;
        // Use the match method to extract the number
        const vibration = capText.match(vibrationRegex);
        const lightMatch = capText.match(lightRegex);
        const nextLightMatch = capText.match(nextLightRegex);
        const durationMatch = capText.match(durationRegex);
        if (vibration) {
          jsonObject.device["haptic"] = 1;
          jsonObject.api.command["vibrate"] = 1;
          const vibrationSpeed = vibration[1];
          jsonObject.api.params["intensity"] = Number(vibrationSpeed);
          console.log(`VibrationSpeed: ${vibrationSpeed}`);
        } else {
          console.log('VibrationSpeed not found');
        } 
        if (lightMatch && nextLightMatch && durationMatch) {
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
      
      // console.log(cue);
      howlPlayerRef.current.playAudio();
    }
    else {
      console.log('not in current howlPlayerRef, audio not triggered.');
    }
    // console.log('cuechange triggered');
    // audioElement.playAudio();
  }
  const handleClick = () => {
    setIsCollecting(prevState => !prevState);
    collectData();
  };

  const handlePlayerReady = (player) => {
    player.addRemoteTextTrack(captionOption);
  };

  return (
    <>
      <div>Rest of app here</div>

      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} howlPlayerRef={howlPlayerRef} />
      <HowlerPlayer ref={howlPlayerRef} />

      <div>Rest of app here</div>
      <button onClick={vibrate}>Toggle Vibrate</button>
      <br/>
      <button onClick={handleClick}>
        {isCollecting ? 'Stop Collecting Data' : 'Start Collecting Data'}
      </button>
    </>
  );
}

export default App;
