'use client';

import React, { useState, useEffect } from 'react';
import { Form, Segment, Button, Icon, Dropdown } from 'semantic-ui-react';
import {
    extractHexColor,
    interpolateHueToHex,
    rainbowColor,
    hexToPressure
} from './Color.jsx';

const presets = [
    { key: 'warm-cool', text: 'Warm → Cool', value: 'warm-cool', minHue: 0, maxHue: 240 },
    { key: 'spring', text: 'Spring (Green → Pink)', value: 'spring', minHue: 120, maxHue: 330 },
    { key: 'sunset', text: 'Sunset (Orange → Purple)', value: 'sunset', minHue: 30, maxHue: 300 },
];

const LightPlayer = ({ activeCue }) => {
    const [radius, setRadius] = useState("100%");
    const [backgroundColor, setBackgroundColor] = useState('white');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [minHue, setMinHue] = useState(presets[0].minHue);
    const [maxHue, setMaxHue] = useState(presets[0].maxHue);
    const [cueNumber, setCueNumber] = useState(null);

    useEffect(() => {
        if (activeCue?.text) {
            const hexString = extractHexColor(activeCue.text);
            if (hexString) {
                setCueNumber(null);
                setBackgroundColor(hexString);
                return;
            }

            const num = parseInt(activeCue.text, 10);
            if (!isNaN(num) && num >= 0 && num <= 100) {
                setCueNumber(num);
                if (activeCue.pressure) {
                    setBackgroundColor(interpolateHueToHex(num, minHue, maxHue));
                } else {
                    setBackgroundColor(rainbowColor(num / 100));
                }
                return;
            }

            // fallback
            setBackgroundColor("#FFFFFF");
        }
    }, [activeCue, minHue, maxHue]);

    const handlePresetChange = (e, { value }) => {
        const preset = presets.find(p => p.value === value);
        if (preset) {
            setMinHue(preset.minHue);
            setMaxHue(preset.maxHue);
        }
    };

    const containerStyles = isFullScreen
        ? 'fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center transition-all duration-500'
        : 'flex justify-center w-full h-full';

    return (
        <Segment attached className="h-full relative">
            <div id="swatch-bg" className={containerStyles} style={{ backgroundColor: isFullScreen ? backgroundColor : "white" }}>
                <div
                    style={{ backgroundColor }}
                    className={`swatch my-5 border border-gray-300 shadow-md transition-colors duration-500 ease-in-out flex flex-col items-center justify-center text-center
                        ${isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-[300px] max-h-[300px] aspect-square rounded-full'}`}
                >
                    {false && activeCue?.text && (
                        <p className="text-outline text-3xl font-semibold text-white drop-shadow">{activeCue.text}</p>
                    )}
                    {activeCue?.text && (
                        <p className="text-outline text-3xl font-semibold text-white drop-shadow">{hexToPressure(backgroundColor).toFixed(1)} kPa</p>
                    )}
                    {activeCue?.pressure && (
                        <p className="text-outline text-xl text-white drop-shadow mt-2">{`${(activeCue.pressure / 1000).toFixed(1)} kPa`}</p>
                    )}
                </div>

                <Button
                    icon
                    circular
                    className="absolute top-2 right-2 !z-10"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                >
                    <Icon name={isFullScreen ? 'compress' : 'expand'} />
                </Button>
            </div>


            {cueNumber !== null && (
                <Form className="mt-4 space-y-4">
                    <Form.Group widths="equal">
                        <Form.Input
                            label="Min Hue"
                            type="number"
                            min={0}
                            max={360}
                            value={minHue}
                            onChange={(e) => setMinHue(parseInt(e.target.value, 10))}
                        />
                        <Form.Input
                            label="Max Hue"
                            type="number"
                            min={0}
                            max={360}
                            value={maxHue}
                            onChange={(e) => setMaxHue(parseInt(e.target.value, 10))}
                        />
                        <Form.Field>
                            <label>Preset</label>
                            <Dropdown
                                selection
                                options={presets}
                                defaultValue="warm-cool"
                                onChange={handlePresetChange}
                            />
                        </Form.Field>
                    </Form.Group>
                    <p className="text-lg">
                        Interpolated Color for {cueNumber}: <strong>{backgroundColor}</strong>
                    </p>
                </Form>
            )}
        </Segment>
    );
};

export default LightPlayer;
