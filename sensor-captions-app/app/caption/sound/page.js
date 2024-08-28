"use client";
import React, { useRef, useEffect } from 'react';
import { SoundPlayer } from './SoundPlayer';  // Import the SoundPlayer component
import { KITCHEN_SOUND_EFFECTS } from '@/AppConfig';  // Assuming you have SOUND_EFFECTS in AppConfig.jsx
import { Button, Container, Segment, Header } from 'semantic-ui-react';
import SynthController from './SynthController';  

const SoundController = () => {
  const kitchenSoundPlayerRef = useRef();
  const synthManagerRef = useRef();

  const triggerSoundByID = (id) => { if (kitchenSoundPlayerRef.current) { kitchenSoundPlayerRef.current.playSoundById(id);} };
  const triggerSoundByName = (name) => { if (kitchenSoundPlayerRef.current) { kitchenSoundPlayerRef.current.playSoundByName(name);} };

  return (
    <Container>
      <Header>Sound Controller</Header>
      <Header attached='top' as='h3'>Kitchen Sound Effects</Header>
      <Segment attached>
        <Button onClick={() => triggerSoundByID(1)}>Play Sound 1</Button>
        <Button onClick={() => triggerSoundByName('bell')}>Play bell</Button>
        <SoundPlayer ref={kitchenSoundPlayerRef} sounds={KITCHEN_SOUND_EFFECTS} />
      </Segment>
      <Header attached='top' as='h3'>Synth Sound Effects</Header>
      <Segment attached>
        <SynthController />
      </Segment>
      
    </Container>
  );
};

export default SoundController;
