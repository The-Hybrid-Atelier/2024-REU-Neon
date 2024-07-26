'use client';

import React, { useEffect, useRef, useState, useContext } from 'react';
import VideoJS from './VideoJS';
import "videojs-youtube";
import HowlerPlayer from './HowlerPlayer';
import { initWebSocket, getReadings, vibrate, light, collectData, command } from '../utils/websocket';
import { ConfigProvider } from '../utils/Configs';
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
    src: '/subtitles/MadL_bendCap.vtt'//'MadL_bend1v3.vtt'   // path to the captions
  };

 

  const handlePlayerReady = (player) => {
    player.addRemoteTextTrack(captionOption);
    
  };

  

  return (
    <>
      <ConfigProvider>
        <VideoJS options={videoJsOptions} onReady={handlePlayerReady} howlPlayerRef={howlPlayerRef} />
        <HowlerPlayer ref={howlPlayerRef} />
      </ConfigProvider>
      
    </>
  );
}

export default App;
