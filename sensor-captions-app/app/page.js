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
  const [clicked, setClicked] = useState("Start")

  const handleGraphClick = (time) => {
    setTimePosition(time);
  };


  const handleClick = () => {
    setClicked(prevState => (prevState === "Start" ? "Stop" : "Start"));
  };

  ///* 
  // In your page.js
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-none h-[30%] bg-[#ffffff] flex justify-center items-center overflow-hidden">
        <div className="w-[80%] h-[80%]"> {/* Adjust width and height as needed */}
          <TimeSeriesViewer
            selectedVideo={selectedVideo}
            timePosition={timePosition}
            onGraphClick={handleGraphClick}
            width="100%" // Ensure full width within its container
            height="100%" // Ensure full height within its container
          />
        </div>
      </div>
      <div className="flex-grow bg-[#ffffff] overflow-auto justify-center items-center">
        <div className="grid grid-cols-2 gap-4">
          <CaptionController 
            selectedVideo={selectedVideo} 
            setSelectedVideo={setSelectedVideo}
            multipleSelection={true} 
          />
        </div>
      </div>
      <div className="flex-none h-[20%] bg-[#ffffff] flex justify-center items-center">
        <button
          onClick={handleClick}
          className={`!flex flex-col justify-center items-center text-white rounded p-2 w-[70%] ${clicked === 'Stop' ? 'bg-red-500 shadow-lg' : 'bg-green-500 shadow-md'} hover:bg-opacity-90`}
          circular
        >
          {clicked}
        </button>
      </div>
    </div>
  );
  


  
  
   //*/

};

export default App;
