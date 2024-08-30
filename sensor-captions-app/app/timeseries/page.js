'use client';

import React, { useState } from 'react';
import { Container } from 'semantic-ui-react';
import TimeSeriesViewer from './TimeSeriesViewer'; // Adjust path as necessary
import { VIDEO_DEFAULT } from '@/AppConfig.jsx'; // Import the VIDEO_DEFAULT
import {FolderStructureDropdowns} from '../utils/FolderStructureDropdowns'; // Adjust path as necessary

const VideoPlayerPage = () => {
  const [videoToPlay, setVideoToPlay] = useState(VIDEO_DEFAULT);
  const [timePosition, setTimePosition] = useState(null);

  const handleSelectionChange = ({ user, bend, trial }) => {
    setVideoToPlay({ userId: user, bendType: bend, trial });
  };

  const handleGraphClick = (time) => {
    setTimePosition(time);
  };

  return (
    <Container>
      <FolderStructureDropdowns defaultVideo={videoToPlay} onSelect={handleSelectionChange} />
      <TimeSeriesViewer 
        videoToPlay={videoToPlay} 
        timePosition={timePosition} 
        onGraphClick={handleGraphClick} 
      />
    </Container>
  );
};

export default VideoPlayerPage;
