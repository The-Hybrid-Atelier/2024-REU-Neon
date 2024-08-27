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



const VibrationPlayer = () => {
    const [vibrationSupported, setVibrationSupported] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (navigator.vibrate) {
            setVibrationSupported(true);
        } else {
            setMessage('Vibration is not supported on this device.');
        }
    }, []);

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

