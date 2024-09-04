'use client';

import React, { useState, useEffect } from 'react';
import { Form, FormField, Label,  Segment } from 'semantic-ui-react';
import { Remote } from '../../websocket/Remote';

const LightPlayer = ({ }) => {
    const [activeCue, setActiveCue] = useState({ "text": "#FFFFFF" });
    const [radius, setRadius] = useState(200);


    const isHexColor = (hex) => {
        return /^#[0-9A-F]{6}$/i.test(hex);
    }

    const websocketEventHandler = (data) => {
        if (data?.event === "light-cue") {
            if(!isHexColor(data?.data.text)) {
                setActiveCue(data?.data);
            }
            else{
                setActiveCue({"text": "#FF0000"});
            }
        }
    }



    return (
        <>
            <Segment attached="top" className="!p-0 flex flex-col justify-center">
                <Remote name="light-captioner" websocketEventHandler={websocketEventHandler}>
                    <Form className="flex flex-col items-start mt-5">
                        <Form.Field inline>
                            <Label>Radius</Label>
                            <input type="range" min="50" max="400" value={radius} onChange={(e) => setRadius(e.target.value)} />
                        </Form.Field>
                    </Form>
                </Remote>
            </Segment>
            <Segment attached className="flex flex-col items-center justify-center !text-2xl">

                <div
                    style={{ backgroundColor: activeCue.text, width: `${radius}px`, height: `${radius}px` }}
                    className="light-cue rounded-full mb-5 border border-gray-300 shadow-md"
                ></div>
                {activeCue && activeCue.text}

            </Segment>
        </>
    );
}

export default LightPlayer;