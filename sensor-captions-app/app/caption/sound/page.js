"use client";
import React, { useRef, useState, useEffect } from 'react';
import { SoundPlayer } from './SoundPlayer';  // Import the SoundPlayer component
import { KITCHEN_SOUND_EFFECTS } from '@/AppConfig';  // Assuming you have SOUND_EFFECTS in AppConfig.jsx
import { Button, Container, Segment, Header, Message} from 'semantic-ui-react';
import SynthController from './SynthController';  
import { Remote } from '../../websocket/Remote';

const SoundController = () => {
  const [activeCue, setActiveCue] = useState({"text": "No active cue."});
  const [synthIntensity, setSynthIntensity] = useState(0);
  const kitchenSoundPlayerRef = useRef();
  const synthManagerRef = useRef();

  const triggerSoundByID = (id) => { if (kitchenSoundPlayerRef.current) { kitchenSoundPlayerRef.current.playSoundById(id);} };
  const triggerSoundByName = (name) => { if (kitchenSoundPlayerRef.current) { kitchenSoundPlayerRef.current.playSoundByName(name);} };

  const websocketEventHandler = (data) => {
    console.log("data");
    setActiveCue(data?.data);
    // debugger;
    if(data?.event === "kitchen-cue") {
      triggerSoundByID(data?.data.id);
    }else if(data?.event === "synth-cue") {
      setSynthIntensity(data?.data.intensity);
    }
  }

  return (
    <Container>
      <Header>Sound Controller</Header>


      <>
            <Segment attached="top" className="!p-0 flex flex-col justify-center">
                <Remote name="kitchen-captioner" websocketEventHandler={websocketEventHandler}/>
            </Segment>
            <Segment attached className="flex flex-row justify-center !text-2xl">
                {activeCue && activeCue.text}
                <Button onClick={() => triggerSoundByID(1)}>Play Sound 1</Button>
                <Button onClick={() => triggerSoundByName('bell')}>Play bell</Button>
                <SoundPlayer ref={kitchenSoundPlayerRef} sounds={KITCHEN_SOUND_EFFECTS} />
                <Message> Triggering ... {activeCue && activeCue.id} </Message>
            </Segment>
        </>

      <>
            <Segment attached="top" className="!p-0 flex flex-col justify-center">
                <Remote name="synth-captioner" websocketEventHandler={websocketEventHandler}/>
            </Segment>
            <Segment attached className="flex flex-row justify-center !text-2xl">
                <SynthController intensity={synthIntensity} setIntensity={setSynthIntensity} />
                {activeCue && activeCue.text}
            </Segment>
        </>
      
    </Container>
  );
};

export default SoundController;
