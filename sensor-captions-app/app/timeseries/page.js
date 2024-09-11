'use client';

import React, { useState, useRef } from 'react';
import { Button, Container } from 'semantic-ui-react';
import TimeSeriesViewer from './TimeSeriesViewer'; // Adjust path as necessary
import { VIDEO_DEFAULT, WINDOWSIZE} from '@/AppConfig.jsx'; // Import the VIDEO_DEFAULT
import {FolderStructureDropdowns} from '../utils/FolderStructureDropdowns'; // Adjust path as necessary
import { Remote } from '../websocket/Remote';

const VideoPlayerPage = () => {
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_DEFAULT);
  const [timePosition, setTimePosition] = useState(null);
  const [sensorData, setSensorData] = useState([0, 0, 1000, 1000, 0, 0]);
  const remoteRef = useRef(null);
  const handleGraphClick = (time) => {
    setTimePosition(time);
  };


  return (
    <Container>
      {/* <FolderStructureDropdowns selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo} />
      <TimeSeriesViewer 
        selectedVideo={selectedVideo} 
        timePosition={timePosition} 
        onGraphClick={handleGraphClick} 
      /> */}
      <Remote title="sensorSimulator" ref={remoteRef} >
        <Button onClick={() => remoteRef.current.jsend({event: "read-pressure1", data: [99384+Math.random()*(107412 -99384) ]})}>Simulate</Button>
      </Remote>

    </Container>
  );
};

export default VideoPlayerPage;
