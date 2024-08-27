'use client';
import 'semantic-ui-css/semantic.min.css';
import React, { useEffect, useRef, useState } from 'react';
import { Container, Segment, Header, Button, Label, Icon } from 'semantic-ui-react';
import { Remote } from './Remote';
import { VIBRATION_PATTERNS } from '@/AppConfig';
function RemoteApp() {

    return (
        <Container textAlign="center" style={{ marginTop: '50px' }}>
            <Remote name="websocket-tester"/>
        </Container>
    );
}

export default RemoteApp;
