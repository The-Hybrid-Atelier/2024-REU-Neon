'use client'

import React, { useEffect, useRef, useState } from 'react';

// This imports the functional component from the previous sample.
import VideoJS from './VideoJS'
import "videojs-youtube";
import HowlerPlayer from './HowlerPlayer';
import { initWebSocket, getReadings, vibrate } from '../utils/websocket';


const App = () => {
  const playerRef = React.useRef(null);
  const howlPlayerRef = React.useRef(null);
  
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
    sources: [
      {
        src: "https://www.youtube.com/watch?v=wvIOqabJv4k",
        type: "video/youtube",
      },
    ],
  }
  // const videoJsOptions = {
  //   autoplay: true,
  //   controls: true,
  //   responsive: true,
  //   fluid: true,
  //   sources: [{
  //     src: '../public/6-5-24 U Bend Trial 1 Video cropped.mp4',
  //     type: 'video/mp4'
  //   }]
  // };
  const captionOption = {
    kind: 'captions',
    srclang: 'en',
    label: 'English',
    src: 'MadL_bend4.vtt'
  };

  const handleCueChange = () => {
    if (howlPlayerRef.current) {
      console.log('playAudio from cuechange triggered')
      const player = playerRef.current;
      const tracks = player.remoteTextTracks();
    
      const track = tracks[0];
      console.log(track);
      if (track.activeCues[0] != null) {
        const capText = track.activeCues[0].text;
        // Define the regular expression to match "VibrationSpeed" followed by a colon, optional whitespace, and a number
        const regex = /VibrationSpeed\s*:\s*(\d+)/;

        // Use the match method to extract the number
        const match = capText.match(regex);

        if (match) {
          const vibrationSpeed = match[1];
          console.log(`VibrationSpeed: ${vibrationSpeed}`);
          vibrate(vibrationSpeed);
        } else {
          console.log('VibrationSpeed not found');
        } 
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

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    playerRef.current.addRemoteTextTrack(captionOption);
    const tracks = playerRef.current.remoteTextTracks();
    console.log(tracks);
    console.log(tracks.length);
    

    for (var i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      track.mode = 'showing';
      console.log(track.cues);
      console.log(track.kind);
      console.log(track.label);
    
    //   // Find the metadata track that's labeled "ads".
    //   if (track.kind === 'metadata' && track.label === 'ads') {
    //     track.mode = 'hidden';
    
    //     // Store it for usage outside of the loop.
    //     metadataTrack = track;
    //   }
    }
    // var audioElement = document.getElementById('howlplayer');
    // console.log(audioElement);
          // Add a listener for the "cuechange" event and start ad playback.
    tracks[0].addEventListener('cuechange', handleCueChange); //{

    // // You can handle player events here, for example:
    // player.on('waiting', () => {
    //   videojs.log('player is waiting');
    // });

    player.on('dispose', () => {
      videojs.log('player will dispose');
    });

    
  };

  return (
    <>
      <div>Rest of app here</div>

      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} 
        
      />
      <HowlerPlayer ref={howlPlayerRef} src="dj-airhorn-sound-39405.mp3" />

      <div>Rest of app here</div>
      <button onClick={vibrate}>Toggle Vibrate</button>
    </>
  );
}

export default App;