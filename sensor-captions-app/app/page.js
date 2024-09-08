// Video.js
"use client"; // This marks the component as client-side in Next.js
import './globals.css';
import React, { useState, useEffect, useRef } from 'react';

import CollapsibleSegment from './utils/CollapsibleSegment';
import TacitCaptionOutput from './components/TacitCaptionOutput';
import TacitCaptionInput from './components/TacitCaptionInput';



function App() {
  const [clicked, setClicked] = useState("Start");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);



  

  return (
    <div className={`w-full h-full flex ${isMobile ? 'flex-col' : 'flex-row'}`}>
      
      <TacitCaptionOutput/>
      <TacitCaptionInput/>
          
      
      
    </div>
  );





  ///* 
  // In your page.js
  //   return (
  //     <div className="w-full h-screen flex flex-col">
  //       <div className="flex-none h-[30%] bg-[#ffffff] flex justify-center items-center overflow-hidden">
  //         <div className="w-[80%] h-[80%]"> {/* Adjust width and height as needed */}
  //           <TimeSeriesViewer
  //             selectedVideo={selectedVideo}
  //             timePosition={timePosition}
  //             onGraphClick={handleGraphClick}
  //             width="100%" // Ensure full width within its container
  //             height="100%" // Ensure full height within its container
  //           />
  //         </div>
  //       </div>
  //       <div className="flex-grow bg-[#ffffff] overflow-auto justify-center items-center">
  //         <div className="grid grid-cols-2 gap-4">
  //           <CaptionController 
  //             selectedVideo={selectedVideo} 
  //             setSelectedVideo={setSelectedVideo}
  //             multipleSelection={true} 
  //           />
  //         </div>
  //       </div>
  //       <div className="flex-none h-[20%] bg-[#ffffff] flex justify-center items-center">
  //         <button
  //           onClick={handleClick}
  //           className={`!flex flex-col justify-center items-center text-white rounded p-2 w-[70%] ${clicked === 'Stop' ? 'bg-red-500 shadow-lg' : 'bg-green-500 shadow-md'} hover:bg-opacity-90`}
  //           circular
  //         >
  //           {clicked}
  //         </button>
  //       </div>
  //     </div>
  //   );





  //    //*/

};

export default App;
