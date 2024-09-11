// ROUTE: DOMAIN/caption/vibration
// This is an implementation prototype of a Vibration Component
// When triggered, the vibration component will vibrate the device (if supported) and display a message
// If not supported, it will display a message. 
// This will also expose different vibration patterns available on the device to explore differnet expressions. 

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Container, Header, Message, Segment } from 'semantic-ui-react';
import { Remote } from '../../websocket/Remote';



const TextPlayer = ({activeCue}) => {
    
    // const [activeCue, setActiveCue] = useState({"text": "No active cue."});
    // const websocketEventHandler = (data) => {
    //     if(data?.event === "text-cue") {
    //         setActiveCue(data?.data);
    //     }
    // }
    return (
        <>
            {/* <Segment attached="top" className="!p-0 flex flex-col justify-center">
                <Remote name="text-captioner" websocketEventHandler={websocketEventHandler}/>
            </Segment> */}
            <Segment attached className="!h-full flex flex-row justify-center !text-2xl">
                {activeCue && activeCue.text}
            </Segment>
        </>

    );
};

export default TextPlayer;

