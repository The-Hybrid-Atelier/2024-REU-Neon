// ROUTE: DOMAIN/caption/vibration
// This is an implementation prototype of a Vibration Component
// When triggered, the vibration component will vibrate the device (if supported) and display a message
// If not supported, it will display a message. 
// This will also expose different vibration patterns available on the device to explore differnet expressions. 

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Container, Header, Message, Segment } from 'semantic-ui-react';
import TextPlayer from './TextPlayer';



const TextCaptionPage = () => {
  
    return (
        <Container style={{ marginTop: '20px' }}>
            <Header as='h2' textAlign='center'>
                Text Caption Tester
            </Header>
            <TextPlayer/>         
        </Container>
    );
};

export default TextCaptionPage;

