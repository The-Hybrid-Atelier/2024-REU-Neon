import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Message } from 'semantic-ui-react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube'; // Ensure the YouTube plugin is imported

const SimpleVideoPlayer = forwardRef(({ selectedVideo, onCueChange}, ref) => {
  const { source, captions } = selectedVideo;
  const options = {
    techOrder: source.type === 'video/youtube' ? ['youtube'] : ['html5'],
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    playbackRates: [0.25, 0.5, 1, 1.5, 2],
    sources: source.url ? [{ src: source.url, type: source.type }] : [],
    tracks: captions,
    preload: 'auto',
    inactivityTimeout: 0, // Disable fading out of controls
  };

  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getPlayer: () => playerRef.current,
  }));

  useEffect(() => {
    if (!videoRef.current) return;

    if (!playerRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log('Player is ready');

        const tracks = player.remoteTextTracks();
        if (tracks.length > 0) {
          const track = tracks[0];
          track.mode = 'showing';
          track.addEventListener('cuechange', onCueChange);
        }

        
      }));
    } else {
      const player = playerRef.current;
      player.src(options.sources);
      player.autoplay(options.autoplay);
      player.ready(() => {
        if (options.sources.length > 0) {
          player.src(options.sources);
        }

       
      });

      const tracks = player.remoteTextTracks();
      if (tracks.length > 0) {
        const track = tracks[0];
        track.mode = 'showing';
        track.addEventListener('cuechange', onCueChange);
      }
    }

    return () => {
      const player = playerRef.current;
      if (player) {
        const tracks = player.remoteTextTracks();
        if (tracks.length > 0) {
          const track = tracks[0];
          if (track) {
            track.removeEventListener('cuechange', onCueChange);
          }
        }
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [options, onCueChange]);

  return (
    <>
      {selectedVideo?.source?.url ? (
        <div data-vjs-player>
          <div ref={videoRef} />
        </div>
      ) : (
        <Message>No video source provided.</Message>
      )}
    </>
  );
});

export default SimpleVideoPlayer;
