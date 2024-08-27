// Video.js
"use client"; // This marks the component as client-side in Next.js
import './globals.css';
import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import HowlerPlayer from './HowlerPlayer';

const helloFlask = 'https://shiny-chainsaw-rqxjgrqrp9pfpq9w-5000.app.github.dev/';

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

  const [checkboxes, setCheckboxes] = useState(Array(4).fill(false)); // Adjusted for 4 checkboxes

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
  console.log('ready');
  setPlayer(event.target);
  let tPlayer = event.target;
  debugger;
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

//goes to a specific part of the vid
const handleSeek = (time) => {
  if (player) {
    player.seekTo(time, true);
  }
};

  // signals the values of checkboxes
  const handleCheckboxChange = (index) => (event) => {
    const newCheckboxes = [...checkboxes];
    newCheckboxes[index] = event.target.checked;
    setCheckboxes(newCheckboxes);
  };

  // checkbox names
  const checkboxLabels = ["Sound", "Volume", "Intensity", "Vibration", "name 5"];

 // Formatting
 return (
  <div className="container">
    <div className="blue-background"></div>
    <div className="left-panel">
      {checkboxLabels.map((label, index) => (
        <div key={index}>
          <input
            type="checkbox"
            id={`checkbox-${index}`}
            checked={checkboxes[index]}
            onChange={handleCheckboxChange(index)}
          />
          <label htmlFor={`checkbox-${index}`}>{label}</label>
        </div>
      ))}
    </div>
    <div className="right-panel">
      <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'red' }}>
        {helloMessage} {/* Display the fetched hello message */}
      </div>
      <h1>Glass Bending Visual</h1>
      <div>
        <label htmlFor="videoSelect" className="select-label">Select A Video:</label>
        <select id="videoSelect" className="select-dropdown" onChange={doVidChange} value={selectedVideo}>
          <option value="madLBend">madLBend</option>
          <option value="madUBend">madUBend</option>
        </select>
      </div>
      <div className="youtube-container">
        <YouTube
          videoId={videoData[selectedVideo].id}
          onReady={onReady}
        />
      </div>
      <div className="button-container">
        {videoData[selectedVideo].events.map((event, index) => (
          <button key={index} className="button" onClick={() => handleSeek(event.time)}>
            {event.label}
          </button>
        ))}
      </div>
      <div className="player-container">
        <a href="/caption/vibration">Vibration Prototype</a>
        <HowlerPlayer src="./dj-airhorn-sound-39405.mp3" />
      </div>
      {chartImage && (
        <div className="chart-container">
          <img src={chartImage} className="bend1expert.png" alt="Pressure over Time Plot" />
        </div>
      )}
    </div>
  </div>
);
};

export default Video;
