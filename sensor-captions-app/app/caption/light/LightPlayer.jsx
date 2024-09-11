'use client';

import React, { useState, useEffect } from 'react';
import { Form, FormField, Label,  Segment } from 'semantic-ui-react';
import { Remote } from '../../websocket/Remote';

const LightPlayer = ({activeCue}) => {
    
    const [radius, setRadius] = useState(200);
    const [backgroundColor, setBackgroundColor] = useState('white');

    const isHexColor = (hex) => {
        return /^#[0-9A-F]{6}$/i.test(hex);
    }

    useEffect(() => {
        if (activeCue?.text) {
            try {
                // verity that the text is a valid hex color
                // extract RGB values from the hex color
                // create a color object with the RGB values
                // set the color object as the background color
                if (isHexColor(activeCue.text)) {
                    setBackgroundColor(activeCue.text);
                }
            }catch (error) {
                setMessage(`Caption Parsing Error: ${JSON.stringify(activeCue)}`);
            }
        }
    }, [activeCue]);


   
    return (
        <Segment attached className="flex flex-col items-center justify-center !text-2xl">
            <div
                style={{ backgroundColor: backgroundColor, width: `${radius}px`, height: `${radius}px` }}
                className="light-cue rounded-full mb-5 border border-gray-300 shadow-md transition-colors duration-500 ease-in-out"
            ></div>
            {activeCue && activeCue.text}
        </Segment>
    );
}

export default LightPlayer;