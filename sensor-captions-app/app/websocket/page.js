'use client';
import 'semantic-ui-css/semantic.min.css';
import React, { useEffect, useRef, useState, useContext } from 'react';
import { Container, Segment, Header, Button, Label, Icon } from 'semantic-ui-react';
import {WEBSOCKET_URL} from '../../AppConfig';


function Remote() {
    const [state, setState] = useState('disconnected');
    const [message, setMessage] = useState('');

    const ws = useRef(null);

    useEffect(() => {
        // Open websocket connection
        ws.current = new WebSocket('wss://haws.cearto.com/ws/');


        // Set up event listeners
        ws.current.onopen = () => {
            setState('connected');
        };

        ws.current.onmessage = (event) => {
            setMessage(event.data);
        };

        ws.current.onclose = () => {
            setState('disconnected');
        };

        // Clean up on component unmount
        return () => {
            ws.current.close();
        };
    }, []);

    const connect = () => {
        ws.current = new WebSocket(WEBSOCKET_URL);
    };

    const disconnect = () => {
        ws.current.close();
    };

    return (
        <Container textAlign="center" style={{ marginTop: '50px' }}>
            <Segment padded="very" raised>
                <Header as="h2" icon textAlign="center">
                    <Icon name="wifi" circular />
                    <Header.Content>WebSocket Remote</Header.Content>
                </Header>

                <Label color={state === 'connected' ? 'green' : 'red'} size="large" style={{ marginBottom: '20px' }}>
                    State: {state}
                </Label>

                <Segment>
                    <Header as="h4">Latest Message</Header>
                    <p>{message || 'No messages received yet'}</p>
                </Segment>

                <Button color="green" onClick={connect} disabled={state === 'connected'}>
                    <Icon name="plug" /> Connect
                </Button>
                <Button color="red" onClick={disconnect} disabled={state === 'disconnected'}>
                    <Icon name="power off" /> Disconnect
                </Button>
            </Segment>
        </Container>
    );
}

export default Remote;
