"use client";
import React, { useRef } from 'react';
import { SoundPlayer } from './SoundPlayer';  // Import the SoundPlayer component
import { KITCHEN_SOUND_EFFECTS } from '@/AppConfig';  // Assuming you have SOUND_EFFECTS in AppConfig.jsx
import { Button, Container, Header } from 'semantic-ui-react';

const SoundController = () => {
  const kitchenSoundPlayerRef = useRef();

  const triggerSound = (id) => {
    if (kitchenSoundPlayerRef.current) {
        kitchenSoundPlayerRef.current.playSoundById(id);
    }
  };

  return (
    <Container>
      <Header>Sound Controller</Header>
      <Button onClick={() => triggerSound(1)}>Play Sound 1</Button>
      <Button onClick={() => triggerSound(2)}>Play Sound 2</Button>
      <SoundPlayer ref={kitchenSoundPlayerRef} sounds={KITCHEN_SOUND_EFFECTS} />
    </Container>
  );
};

export default SoundController;
