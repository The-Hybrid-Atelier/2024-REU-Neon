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
import TimeSeriesViewer from './timeseries/TimeSeriesViewer';


function App() {
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_DEFAULT);

   /*
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
      </div>
    </div>
  );

   */


  const [timePosition, setTimePosition] = useState(null);

  const handleGraphClick = (time) => {
    setTimePosition(time);
  };


  ///* 
  // In your page.js
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-none h-[20%] bg-[#ffd66f] overflow-hidden">
        <div className="w-full h-full p-2"> 
          <TimeSeriesViewer
            selectedVideo={selectedVideo}
            timePosition={timePosition}
            onGraphClick={handleGraphClick}
          />
        </div>
      </div>
      <div className="flex-grow bg-[#5a8af4] overflow-auto">
        <div className="grid grid-cols-2 gap-4">
          <CaptionController 
            selectedVideo={selectedVideo} 
            setSelectedVideo={setSelectedVideo}
            multipleSelection={true} 
          />
        </div>
      </div>
      <div className="flex-none h-[20%] bg-[#9460fd]">
      </div>
    </div>
  );


  
  
   //*/

};

export default App;
