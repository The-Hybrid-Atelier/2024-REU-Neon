// ROUTE: DOMAIN/caption/light

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Container, Header, Message, Segment } from 'semantic-ui-react';
import LightPlayer from './LightPlayer';

const LightCaptionPage = () => {
  
    return (
        <Container style={{ marginTop: '20px' }}>
            <Header as='h2' textAlign='center'>
                Light Caption Tester
            </Header>
            <LightPlayer/>         
        </Container>
    );
};

export default LightCaptionPage;

