//Deals with video

'use client';

import React, { useEffect, useRef, useState, useContext } from 'react';
import VideoJS from './VideoJS';
import "videojs-youtube";
import "./neon.css";
import KitchenSoundPlayer from '../caption/sound/SoundPlayer';
import VibrationPlayer from '../caption/vibration/VibrationPlayer';
import { initWebSocket, getReadings, vibrate, light, collectData, command } from '../utils/websocket';
import { ConfigProvider } from '../utils/Configs';
import { Button } from 'semantic-ui-react';
/** A few comments to commit */

const TacitCaptionPlayer = () => {
  const howlPlayerRef = useRef(null);

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
    src: '/subtitles/MadL_bendMeta.vtt'//'MadL_bend1v3.vtt'   // path to the captions
  };

  const handlePlayerReady = (player) => {
    player.addRemoteTextTrack(captionOption);
  };

  return (
    <>
      <ConfigProvider>
        <VideoJS options={videoJsOptions} onReady={handlePlayerReady} howlPlayerRef={howlPlayerRef} />
        <KitchenSoundPlayer ref={howlPlayerRef} />
      </ConfigProvider>
    </>
  );
}

export default TacitCaptionPlayer;
