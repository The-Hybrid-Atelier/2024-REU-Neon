'use client';

import React, { useState, useEffect } from 'react';
import { Form, FormField, Label,  Segment } from 'semantic-ui-react';
import { Remote } from '../../websocket/Remote';

const LightPlayer = ({activeCue}) => {
    
    const [radius, setRadius] = useState(200);
    const [backgroundColor, setBackgroundColor] = useState('white');

    const extractHexColor = (text) => {
        const match = text.match(/#[0-9A-Fa-f]{6}/);
        return match ? match[0] : null;
    };
        

    useEffect(() => {
        if (activeCue?.text) {
            try {
                // verity that the text is a valid hex color
                // extract RGB values from the hex color
                // create a color object with the RGB values
                // set the color object as the background color
                let hexString = extractHexColor(activeCue.text);

                if (hexString) {
                    setBackgroundColor(hexString);
                }
            }catch (error) {
                setBackgroundColor("#CCCCCC");
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