import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { initWebSocket, getReadings, vibrate, light, collectData, command } from '../utils/websocket';

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

const VideoJS = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady, howlPlayerRef } = props;

  const handleCueChange = () => {
    if (howlPlayerRef.current) {
      console.log('playAudio from cuechange triggered');
      const player = playerRef.current;
      const tracks = player.remoteTextTracks();
      const track = tracks[0];

      if (track && track.activeCues && track.activeCues[0]) {
        const capText = track.activeCues[0].text;
        const label = capText.trim().split(': ')[1];
        console.log('Cue label:', label);
        const audioLabel = soundMapping[label];
        console.log('Playing sound:', audioLabel);

        if (audioLabel) {
          // see if the sound should loop or not
          if (label === '0' || label === '2' || label === '3' || label === '4' || label === '5' || label === '6') {
            howlPlayerRef.current.loop(audioLabel);
          } else {
            howlPlayerRef.current.play(audioLabel);
          }
        } else {
          console.log('Audio label not found or not loaded');
        }
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
      
    } else {
      console.log('not in current howlPlayerRef, audio not triggered.');
    }
  };

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);

        const tracks = player.remoteTextTracks();
        if (tracks.length > 0) {
          const track = tracks[0];
          track.mode = 'showing';
          track.addEventListener('cuechange', handleCueChange);
        }
        player.on("pause", function () {
          jsonObject.api.command["stop"] = Number(1);
          command(jsonObject);
        });
        player.on("play", function () {
          jsonObject.api.command["stop"] = Number(0);
          command(jsonObject);
        });
      });
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
    const websocket = initWebSocket();
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

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};



// old Code
/*
import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoJS = (props) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options, onReady, howlPlayerRef } = props;

  const handleCueChange = () => {
    if (howlPlayerRef.current) {
      console.log('playAudio from cuechange triggered');
      const player = playerRef.current;
      const tracks = player.remoteTextTracks();

      const track = tracks[0];
      if (track.activeCues[0] != null) {
        const capText = track.activeCues[0].text;
        const label = capText.trim().split(': ')[1];

        const soundMapping = {
          'stoveOn': 'stoveOn',
          '0': 'lightBoiling',
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

        const audioLabel = soundMapping[label];

        if (audioLabel) {
          howlPlayerRef.current.play(audioLabel);
        } else {
          console.log('Audio label not found or not loaded');
        }

        // Additional parsing for vibration and light if needed
        const vibrationRegex = /VibrationSpeed\s*:\s*(\d+)/;
        const lightRegex = /LightInten\s*:\s*(\d+)/;
        const nextLightRegex = /NextLightInten\s*:\s*(\d+)/;
        const durationRegex = /Duration\s*:\s*(\d+)/;

        const vibration = capText.match(vibrationRegex);
        const lightMatch = capText.match(lightRegex);
        const nextLightMatch = capText.match(nextLightRegex);
        const durationMatch = capText.match(durationRegex);

        if (vibration) {
          const vibrationSpeed = vibration[1];
          console.log(`VibrationSpeed: ${vibrationSpeed}`);
          // vibrate(vibrationSpeed);
        } else {
          console.log('VibrationSpeed not found');
        }

        if (lightMatch && nextLightMatch && durationMatch) {
          const lightIntensity = lightMatch[1];
          const nextLightIntensity = nextLightMatch[1];
          const duration = durationMatch[1];
          console.log(`lightIntensity: ${lightIntensity}`);
          console.log(`nextLightIntensity: ${nextLightIntensity}`);
          // light(lightIntensity, nextLightIntensity, duration);
        } else {
          console.log('light or NextLight intensity not found');
        }
      }
    } else {
      console.log('not in current howlPlayerRef, audio not triggered.');
    }
  };

  React.useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);

        const tracks = player.remoteTextTracks();
        if (tracks.length > 0) {
          const track = tracks[0];
          track.mode = 'showing';
          track.addEventListener('cuechange', handleCueChange);
        }
      });
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

  React.useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoJS;
*/

export default VideoJS;
