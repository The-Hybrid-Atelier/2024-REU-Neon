// Importing necessary libraries and components
import React, { useRef, useEffect } from 'react'; // React library imports
import YouTube from 'react-youtube'; // YouTube component for embedding YouTube videos
import { Button } from 'semantic-ui-react'; // Button component from Semantic UI for styling
import './neon.css'; // Importing custom CSS for styling

// Sample data for demonstration purposes
const cues = [{time: 30, sound: {frequency: 440, duration: 1}}]; // Array of cue objects with time and sound properties

// Video component definition
const Video = () => {

    // Options for the YouTube player
    const videoOptions = {
        width: '1000px', // Width of the video player
        height: '600px', // Height of the video player
        playerVars: {
            autoplay: 0, // Video will not autoplay
            mute: 0, // Video will not be muted by default
            volume: 100 // Set the volume to 100 (unmuted)
        },
    };

    // Refs for managing state without re-rendering
    const videoRef = useRef(null); // Reference to the YouTube player

    const lastSecondRef = useRef(0); // Reference to store the last second timestamp
    const lastMinuteRef = useRef(0); // Reference to store the last minute timestamp

    // Function to navigate the video to a specific timestamp
    const navigateTo = (seconds) => {
        if (videoRef.current && videoRef.current.internalPlayer) {
            videoRef.current.internalPlayer.seekTo(seconds); // Using the YouTube player's seekTo function
        }
    };