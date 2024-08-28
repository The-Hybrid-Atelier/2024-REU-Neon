"use client";
import React, { useRef } from 'react';
import { SoundPlayer } from './SoundPlayer';  // Import the SoundPlayer component
import { KITCHEN_SOUND_EFFECTS } from '@/AppConfig';  // Assuming you have SOUND_EFFECTS in AppConfig.jsx
import { Button, Container, Header } from 'semantic-ui-react';

const SoundController = () => {
  const kitchenSoundPlayerRef = useRef();

  const triggerSoundByID = (id) => { if (kitchenSoundPlayerRef.current) { kitchenSoundPlayerRef.current.playSoundById(id);} };
  const triggerSoundByName = (name) => { if (kitchenSoundPlayerRef.current) { kitchenSoundPlayerRef.current.playSoundByName(name);} };

  return (
    <Container>
      <Header>Sound Controller</Header>
      <Button onClick={() => triggerSoundByID(1)}>Play Sound 1</Button>
      <Button onClick={() => triggerSoundByName('bell')}>Play bell</Button>
      <SoundPlayer ref={kitchenSoundPlayerRef} sounds={KITCHEN_SOUND_EFFECTS} />
    </Container>
  );
};

export default SoundController;
