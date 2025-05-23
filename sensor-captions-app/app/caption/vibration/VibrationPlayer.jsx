// ROUTE: DOMAIN/caption/vibration
// This is an implementation prototype of a Vibration Component
// When triggered, the vibration component will vibrate the device (if supported) and display a message
// If not supported, it will display a message. 
// This will also expose different vibration patterns available on the device to explore differnet expressions. 

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Container, Header, Message, Segment } from 'semantic-ui-react';
import { Remote } from '../../websocket/Remote';
import { VIBRATION_PATTERNS } from '@/AppConfig';

const parsePattern = (activeText) => {
    // Extract the pattern name by removing special characters and trimming whitespace
    const extractedName = activeText.replace(/[≋]/g, '').trim();
    
    // Find the matching pattern object by its command
    const patternObject = VIBRATION_PATTERNS.find(item => item.command === extractedName);
    
    // Return the pattern if found, otherwise return the default pattern (0)
    return patternObject ? patternObject.pattern : VIBRATION_PATTERNS[0].pattern;
};

const VibrationPlayer = ({activeCue}) => {
    const [vibrationSupported, setVibrationSupported] = useState(false);
    const [message, setMessage] = useState('');


    useEffect(() => {
        if (navigator.vibrate) {
            setVibrationSupported(true);
        } else {
            setMessage('Vibration is not supported on this device.');
        }
    }, []);

    useEffect(() => {
        if(activeCue?.sid){
            const patternID = Math.floor((activeCue.sid / 100) * 6);
            const pattern = VIBRATION_PATTERNS[patternID]?.pattern;
            try {
                if (pattern) {
                    handleVibrate(pattern);
                } else {
                    setMessage(`Invalid Vibration Pattern ID: ${patternID} -- ${pattern}`);
                }
            } catch (error) {
                setMessage(`Live Caption Parsing Error: ${JSON.stringify(activeCue)}`);
            }
        }
        else if (activeCue?.text) {
            try {
                // const patternIndex = parseInt(activeCue.text);
                const pattern = parsePattern(activeCue.text);
                // console.log(VIBRATION_PATTERNS);
                if (patternIndex >= 0 && patternIndex < VIBRATION_PATTERNS.length) {
                    handleVibrate(pattern);
                }else{
                    handleVibrate(pattern);
                    setMessage(`Invalid Vibration Pattern: ${JSON.stringify(activeCue)}`);
                }
            }catch (error) {
                setMessage(`Closed Caption Parsing Error: ${JSON.stringify(activeCue)}`);
            }
        }
    }, [activeCue]);

    const handleVibrate = (pattern) => {
        if (vibrationSupported) {
            console.log('Vibrating with pattern:', pattern);
            navigator.vibrate(pattern);
            // setTimeout(()=> navigator.vibrate(pattern), 1000);
            setMessage(`Vibrating with pattern: ${JSON.stringify(pattern)}`);
        } else {
            setMessage('Vibration is not supported on this device.');
        }
    };

    return (
            <Segment padded>
                {vibrationSupported ? (
                    <Button.Group vertical fluid>
                        {VIBRATION_PATTERNS.map(({ command, label, pattern }) => (
                            <Button
                                key={command}
                                onClick={() => handleVibrate(pattern)}
                                primary={command !== 'stop'}
                                secondary={command === 'stop'}
                            >
                                {label}
                            </Button>
                        ))}
                    </Button.Group>
                ) : (
                    <Message negative>
                        <Message.Header>Vibration Not Supported</Message.Header>
                        <p>{message}</p>
                    </Message>
                )}
                {message && (
                    <Message info style={{ marginTop: '20px' }}>
                        <p>{message}</p>
                    </Message>
                )}
            </Segment>           
    );
};

export default VibrationPlayer;

