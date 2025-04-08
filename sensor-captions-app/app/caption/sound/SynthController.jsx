import React, { useEffect, useRef, useState } from 'react';
import { Container, Header, Segment, Button, Input, Label, ButtonGroup} from 'semantic-ui-react';
import SynthManager from '@/app/utils/SynthManager';  // Adjust the import path as necessary


const SynthController = ({intensity, setIntensity}) => {
  // const [intensity, setIntensity] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const synthManagerRef = useRef();
  const handlePlaySynth = (value) => synthManagerRef?.current.playSampler(value);
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
    synthManagerRef?.current.playSampler(intensity);
  }, [intensity]);
return (

        <Segment className="flex flex-col items-center justify-center p-5">
            {false && [0, 1, 2, 3, 4, 5, 6].map((synth) => (
                <Button key={synth} onClick={() => handlePlaySynth(synth)}>Play Synth {synth}</Button>
            ))}
            <Input
                label={`Intensity ${intensity}`}
                type='range'
                // type="range"
                min="0"
                max="100"
                step="1"
                value={intensity}
                onChange={handleIntensityChange}/>
           <br></br>
            <Input
                label={`Volume ${volume}`}
                type='range'
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                />
            <ButtonGroup className="!m-5" vertical>
              <Button onClick={handleToggleMute}>Toggle Mute</Button>
              <Button color="red" onClick={handleStop}>Stop</Button>
            </ButtonGroup>  
              <SynthManager ref={synthManagerRef} />
        </Segment>
        

);
};

export default SynthController;