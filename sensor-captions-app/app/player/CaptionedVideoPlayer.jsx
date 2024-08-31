import React, { useEffect, useState } from 'react';
import { Container, Header, List, Segment, Divider } from 'semantic-ui-react';
import SimpleVideoPlayer from './SimpleVideoPlayer'; // Adjust path as necessary
import {VIDEO_DEFAULT } from '@/AppConfig.jsx'; // Import the VTT_TYPES array

const CaptionedVideoPlayer = ({ selectedVideo = VIDEO_DEFAULT }) => {
  const { userId, bendType, trial, source, captions} = selectedVideo;

  const videoJsOptions = {
    techOrder: source.type === 'video/youtube' ? ['youtube'] : ['html5'],
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    playbackRates: [0.25, 0.5, 1, 1.5, 2],
    sources: source.url ? [{ src: source.url, type: source.type }] : [],
    tracks: captions,
  };
  console.log('VideoJS Options:', videoJsOptions, JSON.stringify(videoJsOptions, null, 2));

  return (
    <Segment>

      {selectedVideo?.source?.url ? (
        <SimpleVideoPlayer
          options={videoJsOptions}
          onCueChange={() => console.log('Cue changed')}
          onPlay={() => console.log('Video is playing')}
          onPause={() => console.log('Video is paused')}
          onStop={() => console.log('Video has stopped')}
        />
      ) : (
        <p>Loading video...</p>
      )}
    </Segment>
  );
};

export default CaptionedVideoPlayer;
