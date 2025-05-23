"use client";
import React, { useRef, useState, useEffect } from 'react';
import { SoundPlayer } from './SoundPlayer';  // Import the SoundPlayer component
import { KITCHEN_SOUND_EFFECTS } from '@/AppConfig';  // Assuming you have SOUND_EFFECTS in AppConfig.jsx
import { Button, Container, Segment, Header, Message} from 'semantic-ui-react';
import SynthController from './SynthController';  
import { Remote } from '../../websocket/Remote';

const countMusicNotes = (text) => {
    // Match all occurrences of the music note character ♪
    const matches = text.match(/♪/g);
    // Return the count or 0 if there are no matches
    return matches ? matches.length : 0;
};

const TonalPlayer = ({activeCue}) => {
  const [synthIntensity, setSynthIntensity] = useState(0);
  useEffect(() => {
    if (activeCue?.text) {
        try {
            // try to parse int
            // verify it is between 0 and 100; raise error if not
            // set the intensity
            
            if(activeCue.sid){
                var intensity = activeCue.sid;
            }else{
                var intensity = countMusicNotes(activeCue.text);
                intensity = (intensity/6) * 100;
            }
            
            console.log("Intensity Count: ", intensity);
            
            
            if (intensity >= 0 && intensity <= 100) {
                setSynthIntensity(intensity);
            }else{
                setSynthIntensity(0);
                console.log(`Invalid Intensity: ${JSON.stringify(activeCue)}`);
            }
        }catch (error) {
            setSynthIntensity(0);
            console.log(`Caption Parsing Error: ${JSON.stringify(activeCue)}`);
        }
    }
}, [activeCue]);

  return (
    <Segment attached className="flex flex-col justify-center !text-2xl">
        {activeCue?.pressure && (
                        <p className="text-outline text-3xl text-white drop-shadow mt-2">{`${(activeCue.pressure / 1000).toFixed(1)} kPa`}</p>
                    )}
        <Message className="justify-center">{activeCue && activeCue.text}</Message>
        
        <SynthController intensity={synthIntensity} setIntensity={setSynthIntensity} />
        
    </Segment>
  );
};

export default TonalPlayer;