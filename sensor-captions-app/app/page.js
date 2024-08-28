// Video.js
"use client"; // This marks the component as client-side in Next.js
import './globals.css';
import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import HowlerPlayer from './archive/HowlerPlayer';

const helloFlask = 'https://shiny-chainsaw-rqxjgrqrp9pfpq9w-5000.app.github.dev/';
import { Icon, Button, Divider } from 'semantic-ui-react';

/* Import custom button icons */
/*import Light from './app/icons/Lightbulb.svg';
import Bloom from './icons/Bloom.svg';
import Kitchen from './icons/Kitchen.svg';
import Vibrate from './icons/Vibrate.svg';
import CC from './icons/CC.svg';*/

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

/*BUTTONS*/

//handle functionality of button states
const CustomButton = ({ label, icon, isActive, onClick }) => {
  return (
    <button onClick={onClick} className={`custom-button ${isActive ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

const handleButtonClickLeft = (index) => () => {
  const newButtonsLeft = [...buttonsLeft];
  newButtonsLeft[index] = !newButtonsLeft[index];
  setButtonsLeft(newButtonsLeft);
};

//code to handle the buttons in the left panel

const [buttonsLeft, setButtonsLeft] = useState([false, false, false, false, false]); // State for managing button active states

//labels to identify buttons
const buttonLabelsLeft = ["Light", "Synth", "Kitchen", "Vibration", "CC"];
//svg icons array
const svgIconsLeft = [
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
      <path d="M480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-200v-80h320v80H320Zm10-120q-69-41-109.5-110T180-580q0-125 87.5-212.5T480-880q125 0 212.5 87.5T780-580q0 81-40.5 150T630-320H330Zm24-80h252q45-32 69.5-79T700-580q0-92-64-156t-156-64q-92 0-156 64t-64 156q0 54 24.5 101t69.5 79Zm126 0Z"/>
    </svg>,
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
      <path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z"/>
    </svg>,
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
      <path d="M120-640h720v360q0 50-35 85t-85 35H240q-50 0-85-35t-35-85v-360Zm80 80v280q0 17 11.5 28.5T240-240h480q17 0 28.5-11.5T760-280v-280H200Zm-80-120v-80h240v-40q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800v40h240v80H120Zm360 280Z"/>
    </svg>,
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
      <path d="M0-360v-240h80v240H0Zm120 80v-400h80v400h-80Zm760-80v-240h80v240h-80Zm-120 80v-400h80v400h-80ZM320-120q-33 0-56.5-23.5T240-200v-560q0-33 23.5-56.5T320-840h320q33 0 56.5 23.5T720-760v560q0 33-23.5 56.5T640-120H320Zm0-80h320v-560H320v560Zm0 0v-560 560Z"/>
    </svg>,
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
      <path d="M200-160q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h560q33 0 56.5 23.5T840-720v480q0 33-23.5 56.5T760-160H200Zm0-80h560v-480H200v480Zm80-120h120q17 0 28.5-11.5T440-400v-40h-60v20h-80v-120h80v20h60v-40q0-17-11.5-28.5T400-600H280q-17 0-28.5 11.5T240-560v160q0 17 11.5 28.5T280-360Zm280 0h120q17 0 28.5-11.5T720-400v-40h-60v20h-80v-120h80v20h60v-40q0-17-11.5-28.5T680-600H560q-17 0-28.5 11.5T520-560v160q0 17 11.5 28.5T560-360ZM200-240v-480 480Z"/>
    </svg>
];

//code to handle the buttons in the right panel

const handleButtonClickRight = (index) => () => {
  const newButtonsRight = [...buttonsRight];
  newButtonsRight[index] = !newButtonsRight[index];
  setButtonsLeft(newButtonsRight);
};

const [buttonsRight, setButtonsRight] = useState([false, false]); // State for managing button active states
const buttonLabelsRight = ["Rewind5", "Forward5"];

const svgIconsRight = [
  <svg width="72" height="78" viewBox="0 0 72 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M46.7237 68.4633C43.2162 69.7399 39.6882 70.2693 36.1399 70.0513C32.5915 69.8334 29.2704 69.0031 26.1767 67.5605C23.0829 66.1178 20.3121 64.1074 17.8643 61.5293C15.4165 58.9512 13.5543 55.9084 12.2777 52.4008L17.8897 50.3582C19.8813 55.83 23.4765 59.778 28.6753 62.2022C33.8741 64.6264 39.2094 64.8428 44.6811 62.8512C50.1529 60.8597 54.1009 57.2645 56.5251 52.0657C58.9493 46.8669 59.1657 41.5316 57.1741 36.0599C55.1826 30.5881 51.5874 26.6401 46.3886 24.2159C41.1898 21.7916 35.8545 21.5753 30.3828 23.5669L29.9619 23.7201L35.8942 26.4864L33.4467 31.9849L18.1373 24.8461L25.2762 9.53672L30.6855 12.1756L27.9192 18.108L28.3401 17.9548C31.8477 16.6782 35.3756 16.1488 38.924 16.3667C42.4724 16.5847 45.7934 17.415 48.8872 18.8576C51.981 20.3003 54.7517 22.3106 57.1995 24.8888C59.6473 27.4669 61.5095 30.5097 62.7862 34.0173C64.0628 37.5248 64.5922 41.0527 64.3742 44.6011C64.1563 48.1495 63.326 51.4705 61.8834 54.5643C60.4407 57.6581 58.4303 60.4288 55.8522 62.8766C53.2741 65.3244 50.2313 67.1867 46.7237 68.4633Z" fill="black"/>
      <path d="M35.9589 55.6431C34.9173 55.6431 33.9792 55.436 33.1447 55.0217C32.3101 54.6074 31.6414 54.0392 31.1383 53.3171C30.6352 52.5951 30.36 51.7724 30.3126 50.8491H32.4433C32.5262 51.6718 32.899 52.3524 33.5619 52.891C34.2307 53.4237 35.0297 53.69 35.9589 53.69C36.7047 53.69 37.3676 53.5154 37.9476 53.1662C38.5335 52.817 38.9922 52.3376 39.3236 51.728C39.661 51.1125 39.8297 50.417 39.8297 49.6417C39.8297 48.8486 39.6551 48.1413 39.3059 47.5199C38.9626 46.8925 38.4891 46.3983 37.8854 46.0373C37.2817 45.6763 36.5922 45.4928 35.8169 45.4869C35.2605 45.4809 34.6894 45.5668 34.1035 45.7443C33.5175 45.916 33.0352 46.1379 32.6564 46.4102L30.5967 46.1616L31.6976 37.2127H41.1436V39.1658H33.5442L32.905 44.5281H33.0115C33.3844 44.2321 33.8519 43.9865 34.4142 43.7912C34.9765 43.5959 35.5624 43.4982 36.172 43.4982C37.2847 43.4982 38.2761 43.7646 39.1461 44.2972C40.022 44.824 40.7086 45.546 41.2057 46.4634C41.7088 47.3808 41.9604 48.4284 41.9604 49.6062C41.9604 50.7662 41.6999 51.802 41.1791 52.7134C40.6642 53.619 39.954 54.3351 39.0484 54.8619C38.1429 55.3827 37.1131 55.6431 35.9589 55.6431Z" fill="black"/>
    </svg>,
  <svg width="73" height="78" viewBox="0 0 73 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25.6513 68.5668C29.1588 69.8434 32.6868 70.3728 36.2351 70.1549C39.7835 69.9369 43.1046 69.1066 46.1983 67.664C49.2921 66.2213 52.0629 64.211 54.5107 61.6328C56.9585 59.0547 58.8207 56.0119 60.0973 52.5044L54.4853 50.4617C52.4937 55.9335 48.8985 59.8815 43.6997 62.3057C38.5009 64.73 33.1656 64.9463 27.6939 62.9547C22.2221 60.9632 18.2741 57.368 15.8499 52.1692C13.4257 46.9704 13.2093 41.6351 15.2009 36.1634C17.1924 30.6916 20.7876 26.7436 25.9864 24.3194C31.1852 21.8952 36.5205 21.6788 41.9922 23.6704L42.4131 23.8236L36.4808 26.5899L38.9283 32.0885L54.2377 24.9496L47.0988 9.64024L41.6895 12.2791L44.4558 18.2115L44.0349 18.0583C40.5273 16.7817 36.9994 16.2523 33.451 16.4703C29.9026 16.6882 26.5816 17.5185 23.4878 18.9611C20.394 20.4038 17.6233 22.4142 15.1755 24.9923C12.7277 27.5704 10.8655 30.6132 9.58883 34.1208C8.31219 37.6283 7.78284 41.1563 8.00077 44.7046C8.2187 48.253 9.04899 51.5741 10.4916 54.6678C11.9343 57.7616 13.9447 60.5324 16.5228 62.9802C19.1009 65.4279 22.1437 67.2902 25.6513 68.5668Z" fill="black"/>
      <path d="M36.3335 55.7505C35.2918 55.7505 34.3537 55.5434 33.5192 55.1291C32.6847 54.7148 32.0159 54.1466 31.5128 53.4245C31.0097 52.7025 30.7345 51.8798 30.6871 50.9565H32.8178C32.9007 51.7792 33.2736 52.4598 33.9364 52.9984C34.6052 53.5311 35.4042 53.7974 36.3335 53.7974C37.0792 53.7974 37.7421 53.6228 38.3221 53.2736C38.908 52.9244 39.3667 52.445 39.6982 51.8354C40.0355 51.2199 40.2042 50.5244 40.2042 49.7491C40.2042 48.956 40.0296 48.2488 39.6804 47.6273C39.3371 46.9999 38.8636 46.5057 38.2599 46.1447C37.6563 45.7837 36.9667 45.6002 36.1914 45.5943C35.6351 45.5884 35.0639 45.6742 34.478 45.8517C33.892 46.0234 33.4097 46.2453 33.0309 46.5176L30.9712 46.269L32.0721 37.3201H41.5181V39.2733H33.9187L33.2795 44.6355H33.386C33.7589 44.3395 34.2264 44.0939 34.7887 43.8986C35.351 43.7033 35.9369 43.6056 36.5465 43.6056C37.6592 43.6056 38.6506 43.872 39.5206 44.4047C40.3965 44.9314 41.0831 45.6535 41.5803 46.5708C42.0833 47.4882 42.3349 48.5358 42.3349 49.7136C42.3349 50.8736 42.0745 51.9094 41.5536 52.8208C41.0387 53.7264 40.3285 54.4425 39.4229 54.9693C38.5174 55.4901 37.4876 55.7505 36.3335 55.7505Z" fill="black"/>
    </svg>
];






 // Formatting
 return (
  <div className="container">
    <div className="left-panel">
      {buttonLabelsLeft.map((label, index) => (
        <CustomButton
          key={index}
          icon={svgIconsLeft[index]}
          isActive={buttonsLeft[index]}
          onClick={handleButtonClickLeft(index)} // Pass the click handler
        />
      ))}
    </div>
    <div className="middle-panel">
      {/*<div style={{ position: 'absolute', top: '2%', right: '10px', color: 'red' }}>
        {helloMessage} 
      </div>*/} {/* Display the fetched hello message */}
      <div className="heading-1">
        Glass Bending Visual
      </div>  
      <div style={{ position: 'absolute', top: '2%', right: '10px'}}>
        <label htmlFor="videoSelect" className="select-label">Select A Video:</label>
        <select id="videoSelect" className="select-dropdown" onChange={doVidChange} value={selectedVideo}>
          <option value="madLBend">madLBend</option>
          <option value="madUBend">madUBend</option>
        </select>
      </div>
      <div className="youtube-container" style={{ position: 'absolute', top: '6.5%'}}>
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
          <svg
            width="2710"
            height="1423"
            viewBox="0 0 2710 1423"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0)">
              <rect width="2710" height="1423" fill="white" />
              <rect width="2710" height="1423" fill="url(#pattern0)" />
            </g>
            <defs>
              <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                <image id="image0" width="1038" height="545" />
              </pattern>
              <clipPath id="clip0">
                <rect width="2710" height="1423" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}
    </div>
    <div className="right-panel">
      {buttonLabelsRight.map((label, index) => (
          <CustomButton
            key={index}
            icon={svgIconsRight[index]}
            isActive={buttonsRight[index]}
            onClick={handleButtonClickRight(index)} // Pass the click handler
          />
      ))}
    </div>
  </div>
);
};

export default Video;
