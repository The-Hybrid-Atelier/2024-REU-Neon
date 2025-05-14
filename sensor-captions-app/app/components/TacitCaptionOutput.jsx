import React, { useRef, useState, useEffect } from 'react';
import { Remote } from '../websocket/Remote';
import RibbonDropdown from '../dev/RibbonDropdown';

// Caption Players
import { CAPTION_ICON_MAPPING, KITCHEN_SOUND_EFFECTS, AIR_RANGE, VIBRATION_PATTERNS, VTT_TYPES} from '@/AppConfig';
import TextPlayer from '../caption/text/TextPlayer';
import VibrationPlayer from '../caption/vibration/VibrationPlayer';
import MP3SoundPlayer from '../caption/sound/KitchenSoundPlayer';
import LightPlayer from '../caption/light/LightPlayer';
import TonalPlayer from '../caption/sound/TonalPlayer';

import { rainbowColor, hslToHex, hexToRgb} from '../caption/light/Color';


function generateMeter(filledBoxes, numBoxes) {
    const filled = "■".repeat(filledBoxes); // Repeat the filled character
    const empty = "□".repeat(numBoxes - filledBoxes); // Repeat the empty character
    const pressure = (filledBoxes / numBoxes) * (AIR_RANGE.max - AIR_RANGE.min) + AIR_RANGE.min; // Calculate the pressure
    const measurement = ` ${(pressure / 1000).toFixed(1)} kPa`; // Add the measurement
    return filled + empty + measurement; // Concatenate the filled and empty parts
}

const TacitCaptionOutput = () => {
    const remoteRef = useRef(null);
    const [activated_captions, setActivatedCaptions] = useState([]);
    const activatedCaptionsRef = useRef(activated_captions); // To store the latest activated_captions
    const [activeCue, setActiveCue] = useState({ text: "No active cue." });

    useEffect(() => {
        // Sync the latest state of activated_captions to the ref
        activatedCaptionsRef.current = activated_captions;
    }, [activated_captions]);

    // PHONE DEVICE
    const captions = VTT_TYPES;
    const modes = captions.map((caption) => {
        return {
            label: caption,
            icon: CAPTION_ICON_MAPPING[caption],
            value: caption,
        };
    });

    const websocketEventHandler = (data) => {
        if (data?.data) {
            if (data?.event === "vtt-cue") {
                setActiveCue(data?.data);
            } else if (data?.event === "live-cue") {
                
                const p = parseInt(data?.data.text) / 100;
                const pressure = parseInt(data?.data?.pressure);
                console.log("Received live cue:", p,  pressure);
                const kid = Math.floor(p * KITCHEN_SOUND_EFFECTS.length);
                const vid = Math.floor(p * VIBRATION_PATTERNS.length);
                const sid = Math.floor(p * 100);
                const tmeter = generateMeter(Math.ceil(p * 10), 10);

                if (isActivated("light")) {
                    setActiveCue({ text: rainbowColor(p) , sid: sid, pressure: pressure});
                    // convert from hex to RGB
                    const { r, g, b } = hexToRgb(rainbowColor(p));
                    remoteRef.current.jsend({api: "LED_COLOR", sid: sid, params: {red: r, green: g, blue: b}});
                } else if (isActivated("sound")) {
                    setActiveCue({ text: kid.toString(), sid: sid, pressure: pressure });
                }
                else if (isActivated("vibration")) {
                    setActiveCue({ text: vid.toString(), sid: sid, pressure: pressure  });
                }
                else if (isActivated("synth")) {
                    setActiveCue({ text: sid.toString(), sid: sid, pressure: pressure  });
                } else if (isActivated("meter")) {
                    setActiveCue({ text: tmeter, sid: sid, pressure: pressure  });
                }
            }
        }
    };

    const isActivated = (caption_type) => {
        return activated_captions.some(
            (caption) => caption.value === caption_type
        );
    };

    return (
        <Remote
            name="output-controller"
            ref={remoteRef}
            websocketEventHandler={websocketEventHandler}
        >
            <RibbonDropdown
                modes={modes}
                isActive={activated_captions}
                setIsActive={setActivatedCaptions}
                typeSelect="single"
                label="Select Caption Type"
            />
            <div className="flex flex-column items-start justify-center h-full">
                {isActivated("meter") && <TextPlayer activeCue={activeCue} />}
                {isActivated("vibration") && <VibrationPlayer activeCue={activeCue} />}
                {isActivated("sound") && (
                    <MP3SoundPlayer activeCue={activeCue} sounds={KITCHEN_SOUND_EFFECTS} />
                )}
                {isActivated("light") && <LightPlayer activeCue={activeCue} />}
                {isActivated("synth") && <TonalPlayer activeCue={activeCue} />}
                {isActivated("ifttt") && <TonalPlayer activeCue={activeCue} />}
                {/* {JSON.stringify(activated_captions)} */}
            </div>
        </Remote>
    );
};

export default TacitCaptionOutput;
