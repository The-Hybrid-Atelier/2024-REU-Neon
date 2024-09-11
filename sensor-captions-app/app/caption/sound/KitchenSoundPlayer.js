"use client";
import React, { useRef, useState, useEffect } from 'react';
import { SoundPlayer } from './SoundPlayer';  // Import the SoundPlayer component
import { Button, Container, Segment, Header, Message} from 'semantic-ui-react';
import { text } from '@fortawesome/fontawesome-svg-core';

const MP3SoundPlayer = ({activeCue, sounds}) => {
  const [message, setMessage] = useState({text: "No active cue."}); 
  const kitchenSoundPlayerRef = useRef();
  const triggerSoundByID = (id) => { 
    if (kitchenSoundPlayerRef.current) { 
        kitchenSoundPlayerRef.current.playSoundById(id);
        setMessage(`Playing Sound: ${id}`);
    } 
};
  const triggerSoundByName = (name) => { 
    if (kitchenSoundPlayerRef.current) { 
        kitchenSoundPlayerRef.current.playSoundByName(name);
        setMessage(`Playing Sound: ${name}`);
    } 
};

  useEffect(() => {
        if (activeCue?.text) {
            try {
                const patternIndex = parseInt(activeCue.text);
                const sound = sounds.find(sound => sound.id === patternIndex);
                if (patternIndex >= 0 && patternIndex < sounds.length) {
                    triggerSoundByID(patternIndex);
                    
                    setMessage(`Playing Sound: ${sound.label}`);
                }else{
                    setMessage(`Invalid Sound: ${JSON.stringify(activeCue)}`);
                }
            }catch (error) {
                setMessage(`Caption Parsing Error: ${JSON.stringify(activeCue)}`);
            }
        }
    }, [activeCue]);

  return (
    <SoundPlayer ref={kitchenSoundPlayerRef} sounds={sounds} />

  );
};

export default MP3SoundPlayer;
