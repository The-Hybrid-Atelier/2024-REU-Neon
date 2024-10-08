"use client";
import React, { useRef, useState, useEffect } from 'react';
import { SoundPlayer } from './SoundPlayer';  // Import the SoundPlayer component
import { KITCHEN_SOUND_EFFECTS } from '@/AppConfig';  // Assuming you have SOUND_EFFECTS in AppConfig.jsx
import { Button, Container, Segment, Header, Message} from 'semantic-ui-react';
import SynthController from './SynthController';  
import { Remote } from '../../websocket/Remote';

const TonalPlayer = ({activeCue}) => {
  const [synthIntensity, setSynthIntensity] = useState(0);
  useEffect(() => {
    if (activeCue?.text) {
        try {
            // try to parse int
            // verify it is between 0 and 100; raise error if not
            // set the intensity
            const intensity = parseInt(activeCue.text);
            if (intensity >= 0 && intensity <= 100) {
                setSynthIntensity(intensity);
            }else{
                console.log(`Invalid Intensity: ${JSON.stringify(activeCue)}`);
            }
        }catch (error) {
            console.log(`Caption Parsing Error: ${JSON.stringify(activeCue)}`);
        }
    }
}, [activeCue]);

  return (
    <Segment attached className="flex flex-col justify-center !text-2xl">
        <Message className="justify-center">{activeCue && activeCue.text}</Message>
        <SynthController intensity={synthIntensity} setIntensity={setSynthIntensity} />
        
    </Segment>
  );
};

export default TonalPlayer;
