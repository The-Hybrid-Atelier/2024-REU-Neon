import React, {useRef, useState} from 'react';
import { Remote } from '../websocket/Remote';
import Ribbon from '../dev/Ribbon';
import { CAPTION_ICON_MAPPING, KITCHEN_SOUND_EFFECTS} from '@/AppConfig';
import TextPlayer from '../caption/text/TextPlayer';
import VibrationPlayer from '../caption/vibration/VibrationPlayer';
import MP3SoundPlayer from '../caption/sound/KitchenSoundPlayer';
import LightPlayer from '../caption/light/LightPlayer';
const TacitCaptionOutput = () => {
    const remoteRef = useRef(null);
    const [activated_captions, setActivatedCaptions] = useState([]);
    const [activeCue, setActiveCue] = useState({"text": "No active cue."});
    
    // PHONE DEVICE
    const captions = ["light", "meter", "vibration", "sound" ,"synth"]
    const modes = captions.map(caption => {
        return{
          label: caption,
          icon: CAPTION_ICON_MAPPING[caption],
          value: caption
        }
    });
    
    const websocketEventHandler = (data) => {
        if(data?.data){
            setActiveCue(data?.data);
        }
    }
    const isActivated = (caption_type) => {
        return activated_captions.some(caption => caption.value === caption_type);
    };
      
    
    
    return (
        <Remote name="output-controller" 
                ref={remoteRef}
                websocketEventHandler={websocketEventHandler}
                >
           <Ribbon
                modes={modes}
                isActive={activated_captions}
                setIsActive={setActivatedCaptions}
                typeSelect='single'
            />
            

            {isActivated("meter") && <TextPlayer activeCue={activeCue}/>}
            {isActivated("vibration") && <VibrationPlayer activeCue={activeCue}/>}
            {isActivated("sound") && <MP3SoundPlayer activeCue={activeCue} sounds={KITCHEN_SOUND_EFFECTS}/>}
            {isActivated("light") && <LightPlayer activeCue={activeCue}/>}
        </Remote>   
    );
};

export default TacitCaptionOutput;