// Video.js

"use client"; // This marks the component as client-side in Next.js

import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import './globals.css';


const helloFlask = 'https://animated-trout-96xw6vx4wpgh9pj5-5000.app.github.dev/';

// Python Flask Connect Message
const fetchHelloMessage = async () => {
  try {
    const response = await fetch(helloFlask);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error fetching hello message:', error);
    return "Failed to fetch message.";
  }
};

const videoData = {
  madLBend: {
    id: 'wvIOqabJv4k',
    events: [
      { label: 'Event1', time: 0 },
      { label: 'Event2', time: 15 },
      { label: 'Event3', time: 30 }
    ]
  },
  madUBend: {
    id: '1GqPAZwEu_0',
    events: [
      { label: 'Event1', time: 15 },
      { label: 'Event2', time: 50 },
      { label: 'Event3', time: 90 }
    ]
  }
};

// State of the vid, store the vid, player instance, playback time, the chart url, and the interval, finally the size
// Inside the Video component
const Video = () => {
  const [selectedVideo, setSelectedVideo] = useState('madLBend');
  const [player, setPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [chartImage, setChartImage] = useState(null);  // Ensure chartImage state is defined
  const [helloMessage, setHelloMessage] = useState(""); // State for storing the hello message
  const intervalRef = useRef(null);

  // Move fetchPlotImage inside the component
  const fetchPlotImage = async () => {
    try {
      // const response = await fetch(`${helloFlask}plot_test`);
      const response = await fetch(`${helloFlask}plot`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setChartImage(imageUrl);
    } catch (error) {
      console.error('Error fetching plot image:', error.message);
      setChartImage(null);
    }
  };

  useEffect(() => {
    fetchHelloMessage().then(message => setHelloMessage(message)); // Fetch and set the hello message
    fetchPlotImage();  // Now this should work as intended
  }, []);
  
//updates chart everytime
useEffect(() => {
  if (player) {
    intervalRef.current = setInterval(() => {
      setCurrentTime(player.getCurrentTime());
    }, 100);
    return () => clearInterval(intervalRef.current);
  }
}, [player]);

//gets chart img based on video
const fetchChartImage = (time) => {
  fetch(`/api/get_chart_image?video=${selectedVideo}&time=${time}`)
    .then(response => response.blob())
    .then(imgBlob => {
      const imageUrl = URL.createObjectURL(imgBlob);
      setChartImage(imageUrl);
    })
    .catch(error => {
      console.error('Error in getting chart image:', error);
    });
};

//changes vid off of dropdown
const doVidChange = (event) => {
  setSelectedVideo(event.target.value);
  setChartImage(null);
  fetchChartImage(0); 
};

const onReady = (event) => {
  setPlayer(event.target);
};

//goes to a specific part of the vid
const handleSeek = (time) => {
  if (player) {
    player.seekTo(time, true);
  }
};

 // Formatting
 return (
  <div>
    <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'red' }}>
      {helloMessage} {/* Display the fetched hello message */}
    </div>
    <h1>Glass Bending Visual</h1>
    <div>
      <label htmlFor="videoSelect">Select A Video:</label>
      <select id="videoSelect" onChange={doVidChange} value={selectedVideo}>
        <option value="madLBend">madLBend</option>
        <option value="madUBend">madUBend</option>
      </select>
    </div>
    <YouTube
      videoId={videoData[selectedVideo].id}
      onReady={onReady}
    />
    <div>
      {videoData[selectedVideo].events.map((event, index) => (
        <button key={index} onClick={() => handleSeek(event.time)}>
          {event.label}
        </button>
      ))}
    </div>
    {chartImage && (
      <div style={{ width: '100%', marginTop: '20px' }}>
        <img src={chartImage} alt="Pressure over Time Plot" style={{ width: '100%' }} />
      </div>
    )}
  </div>
);
};

export default Video;

