'use client';

import React, { useEffect, useRef, useState } from 'react';
import VideoJS from './VideoJS';
import "videojs-youtube";
import HowlerPlayer from './HowlerPlayer';
import { initWebSocket, getReadings, vibrate, light, collectData, command } from '../utils/websocket';

/** A few comments to commit */

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

  // useEffect(() => {
  //   const websocket = initWebSocket();
  //   getReadings();
    
  //   return () => {
  //       // if (websocket) {
  //       //     websocket.close();
  //       // }
  //   };
  // }, []);

  const videoJsOptions = {
    techOrder: ["youtube"],
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    playbackRates: [0.25, 0.5, 1, 1.5, 2],
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
    src: '/subtitles/MadL_bendCap.vtt' //'/subtitles/MadL_bendCap.vtt'  // path to the captions
  };

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
