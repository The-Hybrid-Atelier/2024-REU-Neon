'use client';

import React, { useState } from 'react';
import { Container } from 'semantic-ui-react';
import CaptionedVideoPlayer from './CaptionedVideoPlayer'; // Adjust path as necessary
import { VIDEO_DEFAULT } from '@/AppConfig.jsx'; // Import the VIDEO_DEFAULT
import {FolderStructureDropdowns} from './FolderStructureDropdowns'; // Adjust path as necessary

const VideoPlayerPage = () => {
  const [videoToPlay, setVideoToPlay] = useState(VIDEO_DEFAULT);

  const handleSelectionChange = ({ user, bend, trial }) => {
    console.log('Selected:', { user, bend, trial });
    // Update the videoToPlay state with the selected values
    setVideoToPlay({ userId: user, bendType: bend, trial });
  };

  return (
    <Container>
      <FolderStructureDropdowns defaultVideo={VIDEO_DEFAULT} onSelect={handleSelectionChange} />
      <CaptionedVideoPlayer videoToPlay={videoToPlay} />
    </Container>
  );
};

export default VideoPlayerPage;
