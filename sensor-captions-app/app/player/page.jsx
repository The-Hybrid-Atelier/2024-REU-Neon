'use client';

import React, { useEffect, useState } from 'react';
import { Container } from 'semantic-ui-react';
import CaptionedVideoPlayer from './CaptionedVideoPlayer'; // Adjust path as necessary
import { VTT_TYPES, VIDEO_DEFAULT } from '@/AppConfig.jsx'; // Import the VTT_TYPES array

const VideoPlayerPage = ({ videoToPlay = VIDEO_DEFAULT }) => {


  return (
    <Container>
      <CaptionedVideoPlayer
        videoToPlay={videoToPlay}
      />
    </Container>
  );
};

export default VideoPlayerPage;
