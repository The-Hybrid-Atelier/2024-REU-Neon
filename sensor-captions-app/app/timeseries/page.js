'use client';

import React, { useState } from 'react';
import { Container } from 'semantic-ui-react';
import TimeSeriesViewer from './TimeSeriesViewer'; // Adjust path as necessary
import { VIDEO_DEFAULT } from '@/AppConfig.jsx'; // Import the VIDEO_DEFAULT
import {FolderStructureDropdowns} from '../utils/FolderStructureDropdowns'; // Adjust path as necessary

const VideoPlayerPage = () => {
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_DEFAULT);
  const [timePosition, setTimePosition] = useState(null);

  const handleGraphClick = (time) => {
    setTimePosition(time);
  };

  return (
    <Container>
      <FolderStructureDropdowns selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo} />
      <TimeSeriesViewer 
        selectedVideo={selectedVideo} 
        timePosition={timePosition} 
        onGraphClick={handleGraphClick} 
      />
    </Container>
  );
};

export default VideoPlayerPage;
