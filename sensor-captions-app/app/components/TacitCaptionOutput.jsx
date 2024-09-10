import React, {useRef, useState} from 'react';
import { Remote } from '../websocket/Remote';
import Ribbon from '../dev/Ribbon';
import { CAPTION_ICON_MAPPING } from '@/AppConfig';
import TextPlayer from '../caption/text/TextPlayer';
const TacitCaptionOutput = () => {
    const remoteRef = useRef(null);
    const [activated_captions, setActivatedCaptions] = useState([]);
    const [activeMeterCue, setActiveMeterCue] = useState({"text": "No active cue."});
    
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
        if(data?.event === "meter-cue") {
            setActiveMeterCue(data?.data);
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
            
            {isActivated("meter") && <TextPlayer activeCue={activeMeterCue}/>}
            
        </Remote>   
    );
};

export default TacitCaptionOutput;