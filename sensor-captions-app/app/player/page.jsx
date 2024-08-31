'use client';

import React, { useState } from 'react';
import { Container } from 'semantic-ui-react';
import CaptionedVideoPlayer from './CaptionedVideoPlayer'; // Adjust path as necessary
import { VIDEO_DEFAULT } from '@/AppConfig.jsx'; // Import the VIDEO_DEFAULT
import {FolderStructureDropdowns} from '../utils/FolderStructureDropdowns'; // Adjust path as necessary

const VideoPlayerPage = () => {
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_DEFAULT);
  return (
    <Container>
      <FolderStructureDropdowns selectedVideo={VIDEO_DEFAULT} setSelectedVideo={setSelectedVideo} />
      <CaptionedVideoPlayer selectedVideo={selectedVideo} />
    </Container>
  );
};

export default VideoPlayerPage;
