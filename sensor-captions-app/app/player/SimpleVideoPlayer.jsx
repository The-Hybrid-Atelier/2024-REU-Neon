import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube'; // Ensure the YouTube plugin is imported

const SimpleVideoPlayer = ({ options, onCueChange, onPlay, onPause, onStop }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) {
      // Create the video.js player element
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      // Initialize the player
      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log('Player is ready');

        // Handle text tracks (e.g., subtitles)
        const tracks = player.remoteTextTracks();
        if (tracks.length > 0) {
          const track = tracks[0];
          track.mode = 'showing';
          track.addEventListener('cuechange', onCueChange);
        }

        // Set up event listeners
        player.on('play', () => {
          onPlay && onPlay(player);
        });

        player.on('pause', () => {
          onPause && onPause(player);
        });

        player.on('ended', () => {
          onStop && onStop(player);
        });
      }));
    } else {
      // If the player already exists, update the source and other options
      const player = playerRef.current;
      player.src(options.sources);
      player.autoplay(options.autoplay);
      player.ready(() => {
        if (options.sources.length > 0) {
          player.src(options.sources);
        }
      });

      // Update text tracks
      const tracks = player.remoteTextTracks();
      if (tracks.length > 0) {
        const track = tracks[0];
        track.mode = 'showing';
        track.addEventListener('cuechange', onCueChange);
      }
    }

    return () => {
      // Cleanup on unmount
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
  }, [options, onCueChange, onPlay, onPause, onStop]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

export default SimpleVideoPlayer;
