// Video.js

"use client"; // This marks the component as client-side in Next.js

import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import './globals.css';

// State of the vid, store the vid, player instance, playback time, the chart url, and the interval, finally the size
// Inside the Video component
const Video = () => {
  const [selectedVideo, setSelectedVideo] = useState('madLBend');
  const [player, setPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [chartImage, setChartImage] = useState(null);  // Ensure chartImage state is defined
  const [helloMessage, setHelloMessage] = useState(""); // State for storing the hello message
  const intervalRef = useRef(null);

const onReady = (event) => {
  console.log('ready');
  setPlayer(event.target);
  let tPlayer = event.target;
  if (tPlayer) {
    tPlayer.addEventListener('onCueChange', function(event) {
      var cues = event.cues;
      console.log('cue change event:', cues);
    });
  }
  else {
    console.log('player not initialized');
  }
};



 // Formatting
 return (
  <div>
    <h1>Glass Bending Visual</h1>
    <video src="/ubend.mp4">
      
      
    </video>
  </div>
);
};

export default Video;