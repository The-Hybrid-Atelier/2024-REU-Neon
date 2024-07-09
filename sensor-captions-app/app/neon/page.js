'use client'

import React from 'react';

// This imports the functional component from the previous sample.
import VideoJS from './VideoJS'
import "videojs-youtube";

const App = () => {
  const playerRef = React.useRef(null);

  const videoJsOptions = {
    techOrder: ["youtube"],
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: "https://www.youtube.com/watch?v=IxQB14xVas0",
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

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on('waiting', () => {
      videojs.log('player is waiting');
    });

    player.on('dispose', () => {
      videojs.log('player will dispose');
    });
  };

  return (
    <>
      <div>Rest of app here</div>

      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
      

      <div>Rest of app here</div>
    </>
  );
}

export default App;