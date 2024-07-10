'use client'

import React, { useEffect, useRef } from 'react';

// This imports the functional component from the previous sample.
import VideoJS from './VideoJS'
import "videojs-youtube";
import HowlerPlayer from './HowlerPlayer';

const App = () => {
  const playerRef = React.useRef(null);
  const howlPlayerRef = React.useRef(null);

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
    src: 'MadL_bend2.vtt'
  };

  const handleCueChange = () => {
    if (howlPlayerRef.current) {
      console.log('playAudio from cuechange triggered')
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
    player.addRemoteTextTrack(captionOption);
    const tracks = player.remoteTextTracks();
    
    console.log(tracks.length);
    

    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      console.log(track.cues);
      console.log(track.kind);
      console.log(track.label);
    
      // Find the metadata track that's labeled "ads".
      if (track.kind === 'metadata' && track.label === 'ads') {
        track.mode = 'hidden';
    
        // Store it for usage outside of the loop.
        metadataTrack = track;
      }
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
    </>
  );
}

export default App;