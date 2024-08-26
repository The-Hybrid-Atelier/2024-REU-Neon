// ROUTE: DOMAIN/caption/vibration
// This is an implementation prototype of a Vibration Component
// When triggered, the vibration component will vibrate the device (if supported) and display a message
// If not supported, it will display a message. 
// This will also expose different vibration patterns available on the device to explore differnet expressions. 

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Container, Header, Message, Segment } from 'semantic-ui-react';

// LIBRARY OF VIBRATION PATTERNS
const vibrationPatterns = {
    shortPulse: { label: 'Vibrate: Short Pulse', pattern: [200, 100, 200] },
    longPulse: { label: 'Vibrate: Long Pulse', pattern: [500, 200, 500, 200, 500] },
    longDuration: { label: 'Vibrate: Long Duration', pattern: [1000, 500, 1000] },
    rapidPulse: { label: 'Vibrate: Rapid Pulse', pattern: [50, 30, 50, 30, 50, 30] },
    stop: { label: 'Stop Vibration', pattern: 0 }
};

const VibrationComponent = () => {
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
            navigator.vibrate(pattern);
            // setTimeout(()=> navigator.vibrate(pattern), 1000);
            setMessage(`Vibrating with pattern: ${JSON.stringify(pattern)}`);
        } else {
            setMessage('Vibration is not supported on this device.');
        }
    };

    return (
        <Container style={{ marginTop: '20px' }}>
            <Header as='h2' textAlign='center'>
                Vibration Component
            </Header>
            <Segment padded>
                {vibrationSupported ? (
                    <Button.Group vertical fluid>
                        {Object.keys(vibrationPatterns).map((key) => (
                            <Button
                                key={key}
                                onClick={() => handleVibrate(vibrationPatterns[key].pattern)}
                                primary={key !== 'stop'}
                                secondary={key === 'stop'}
                            >
                                {vibrationPatterns[key].label}
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
        </Container>
    );
};

export default VibrationComponent;

