import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Button, Segment, Input, Message, Icon } from 'semantic-ui-react';

const SoundPlayer = forwardRef(({ sounds }, ref) => {
  const [currentSound, setCurrentSound] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const handlePlaySound = (soundToPlay, label) => {
    // Stop all currently playing sounds
    sounds.forEach((soundEffect) => {
      soundEffect.sound.stop();
    });

    // Play the selected sound and update the current sound
    soundToPlay.volume(isMuted ? 0 : volume);
    soundToPlay.play();
    setCurrentSound(label);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    // Adjust volume for currently playing sound if not muted
    if (currentSound && !isMuted) {
      sounds.forEach((soundEffect) => {
        if (soundEffect.label === currentSound) {
          soundEffect.sound.volume(newVolume);
        }
      });
    }
  };

  const handleToggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);

    // Toggle mute for the currently playing sound
    if (currentSound) {
      sounds.forEach((soundEffect) => {
        if (soundEffect.label === currentSound) {
          soundEffect.sound.volume(newMuteState ? 0 : volume);
        }
      });
    }
  };

  // Expose a method to trigger sounds by id
  useImperativeHandle(ref, () => ({
    playSoundById: (id) => {
      const soundToPlay = sounds.find((soundEffect) => soundEffect.id === id);
      if (soundToPlay) {
        handlePlaySound(soundToPlay.sound, soundToPlay.label);
      }
    },
    playSoundByName: (name) => {
      const soundToPlay = sounds.find((soundEffect) => soundEffect.command === name);
      if (soundToPlay) {
        handlePlaySound(soundToPlay.sound, soundToPlay.label);
      }
    },
  }));

  return (
    <Segment textAlign="center">
      <div>
        {currentSound ? (
          <Message>
            <strong>Currently Playing:</strong> {currentSound}
          </Message>
        ) : (
          <Message>No sound playing</Message>
        )}
      </div>
      <h3>Sound Effects</h3>
      <Button.Group vertical>
        {sounds.map((soundEffect) => (
          <Button
            key={soundEffect.id}
            onClick={() => handlePlaySound(soundEffect.sound, soundEffect.label)}
            content={soundEffect.label}
            primary
          />
        ))}
      </Button.Group>
      <div style={{ marginTop: '20px' }}>
        <Input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          label="Volume"
        />
      </div>
      <Button
        color={isMuted ? 'green' : 'red'}
        onClick={handleToggleMute}
        icon
        style={{ marginTop: '10px' }}
      >
        <Icon name={isMuted ? 'volume up' : 'volume off'} />
        {isMuted ? 'UNMUTE' : 'MUTE'}
      </Button>
    </Segment>
  );
});

export { SoundPlayer };
