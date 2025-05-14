"use client";
import React, { useRef, useState, useEffect } from 'react';
import { SoundPlayer } from './SoundPlayer';  // Import the SoundPlayer component
import { Button, Container, Segment, Header, Message} from 'semantic-ui-react';
import { text } from '@fortawesome/fontawesome-svg-core';
import { KITCHEN_SOUND_EFFECTS } from '@/AppConfig'; // Import the sound effects data

const extractCommand = (activeText) => {
  // Extract the sound label from the text (remove ♪ and whitespace)
  const soundLabel = activeText.replace(/[♪]/g, '').trim();

  // Find the matching command based on the label
  const soundEffect = KITCHEN_SOUND_EFFECTS.find(effect =>
      effect.label.toLowerCase().includes(soundLabel.toLowerCase())
  );

  // Return the command or null if not found
  return soundEffect ? soundEffect.command : null;
};



const MP3SoundPlayer = ({activeCue, sounds}) => {
  const [message, setMessage] = useState({text: "No active cue."}); 
  const kitchenSoundPlayerRef = useRef();
  const lastSoundIDRef = useRef(null);
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
        if (activeCue?.sid !== undefined) {
            const soundID = Math.floor((activeCue.sid / 100) * 4);
            const name = KITCHEN_SOUND_EFFECTS[soundID]?.command;

            try {
                if (name) {
                    if (lastSoundIDRef.current !== soundID) {
                        triggerSoundByName(name);
                        setMessage(`Playing Sound: ${name}`);
                        lastSoundIDRef.current = soundID; // update ref
                    }
                } else {
                    triggerSoundByName("noSound");
                    setMessage(`Invalid Sound ID: ${soundID} -- ${name}`);
                }
            } catch (error) {
                setMessage(`Live Caption Parsing Error: ${JSON.stringify(activeCue)}`);
            }
        }
        else if (activeCue?.text) {
            try {
                // const patternIndex = parseInt(activeCue.text);
                // const sound = sounds.find(sound => sound.id === patternIndex);
                const soundName = extractCommand(activeCue.text);
                if (soundName) {
                    // triggerSoundByID(patternIndex);
                    triggerSoundByName(soundName);
                    setMessage(`Playing Sound: ${sound.label}`);
                }else{
                  triggerSoundByName("noSound");
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
