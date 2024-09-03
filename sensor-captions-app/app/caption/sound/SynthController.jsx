import React, { useEffect, useRef, useState } from 'react';
import { Container, Header, Segment, Button, Input, Label } from 'semantic-ui-react';
import SynthManager from '@/app/utils/SynthManager';  // Adjust the import path as necessary


const SynthController = ({intensity, setIntensity}) => {
  // const [intensity, setIntensity] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const synthManagerRef = useRef();
  const handlePlaySynth = (value) => synthManagerRef?.current.playSynth(value);
  const handleToggleMute = () => synthManagerRef?.current.toggleMute();
  const handleVolumeChange = (e, { value }) => {
    setVolume(value);
    synthManagerRef?.current.setVolume(value);
  }

  
  const handleIntensityChange = (e, { value }) => {
    setIntensity(value);
    
  }
  const handleStop = () => synthManagerRef?.current.stop()
  
  useEffect(() => {
    synthManagerRef?.current.playSynth(intensity);
  }, [intensity]);
return (
    <Container>
        <Header>Synth Controller</Header>
        <Segment>
            {[0, 1, 2, 3, 4, 5, 6].map((synth) => (
                <Button key={synth} onClick={() => handlePlaySynth(synth)}>Play Synth {synth}</Button>
            ))}
            {intensity}
            <Input
                label="Intensity"
                type='range'
                type="range"
                min="0"
                max="100"
                step="1"
                value={intensity}
                onChange={handleIntensityChange}/>
            <Button onClick={handleToggleMute}>Toggle Mute</Button>
            <Button onClick={handleStop}>Stop</Button>
            <Input
                type='range'
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                />
        </Segment>
        <SynthManager ref={synthManagerRef} />
    </Container>
);
};

export default SynthController;