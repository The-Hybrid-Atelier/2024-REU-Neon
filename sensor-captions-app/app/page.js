// Video.js
"use client"; // This marks the component as client-side in Next.js
import './globals.css';
import React, { useState, useEffect, useRef } from 'react';
import { Container, Icon, Button, Divider } from 'semantic-ui-react';
import CaptionController from './player/CaptionController';
import TacitCaptionVideoPlayer from './player/TacitCaptionVideoPlayer';
import VideoController from './player/VideoController';
import { VIDEO_DEFAULT } from '@/AppConfig.jsx'; // Import the VIDEO_DEFAULT
import {FolderStructureDropdowns} from './utils/FolderStructureDropdowns'; // Adjust path as necessary


function App() {
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_DEFAULT);

  return (
    <div className="w-full h-full flex flex-row">
      <div className="panel left-panel">
        <CaptionController selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo}/>
      </div>
      <div className="panel middle-panel">
        <FolderStructureDropdowns selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo}/>
        <TacitCaptionVideoPlayer selectedVideo={selectedVideo} />
      </div>
      <div className="panel right-panel">
        {/* <VideoController /> */}
      </div>
    </div>
  );
};

export default App;
