import React, { useRef, useState, useEffect } from 'react';
import { Remote } from '../websocket/Remote';
import Ribbon from '../dev/Ribbon';
import { CAPTION_ICON_MAPPING, KITCHEN_SOUND_EFFECTS, AIR_RANGE, VIBRATION_PATTERNS } from '@/AppConfig';
import TextPlayer from '../caption/text/TextPlayer';
import VibrationPlayer from '../caption/vibration/VibrationPlayer';
import MP3SoundPlayer from '../caption/sound/KitchenSoundPlayer';
import LightPlayer from '../caption/light/LightPlayer';
import TonalPlayer from '../caption/sound/TonalPlayer';

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0'); // Convert to hex
    };
    return `#${f(0)}${f(8)}${f(4)}`; // Combine RGB values into hex
}

function rainbowColor(p) {
    const hue = p * 360; // Map p [0, 1] to hue [0, 360]
    const saturation = 100; // Full saturation for vibrant colors
    const lightness = 50; // 50% lightness for standard brightness
    return hslToHex(hue, saturation, lightness);
}

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
    const captions = ["light", "meter", "vibration", "sound", "synth"];
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
                const kid = Math.floor(p * KITCHEN_SOUND_EFFECTS.length);
                const vid = Math.floor(p * VIBRATION_PATTERNS.length);
                const sid = Math.floor(p * 100);
                const tmeter = generateMeter(Math.ceil(p * 10), 10);

                if (isActivated("light")) {
                    setActiveCue({ text: rainbowColor(p) });
                } else if (isActivated("sound")) {
                    setActiveCue({ text: kid.toString() });
                }
                else if (isActivated("vibration")) {
                    setActiveCue({ text: vid.toString() });
                }
                else if (isActivated("synth")) {
                    setActiveCue({ text: sid.toString() });
                } else if (isActivated("meter")) {
                    setActiveCue({ text: tmeter });
                }
            }
        }
    };

    const isActivated = (caption_type) => {
        // Use the ref to access the latest value of activated_captions
        return activatedCaptionsRef.current.some(
            (caption) => caption.value === caption_type
        );
    };

    return (
        <Remote
            name="output-controller"
            ref={remoteRef}
            websocketEventHandler={websocketEventHandler}
        >
            <Ribbon
                modes={modes}
                isActive={activated_captions}
                setIsActive={setActivatedCaptions}
                typeSelect="single"
            />

            {isActivated("meter") && <TextPlayer activeCue={activeCue} />}
            {isActivated("vibration") && <VibrationPlayer activeCue={activeCue} />}
            {isActivated("sound") && (
                <MP3SoundPlayer activeCue={activeCue} sounds={KITCHEN_SOUND_EFFECTS} />
            )}
            {isActivated("light") && <LightPlayer activeCue={activeCue} />}
            {isActivated("synth") && <TonalPlayer activeCue={activeCue} />}
            {/* {JSON.stringify(activated_captions)} */}
        </Remote>
    );
};

export default TacitCaptionOutput;
