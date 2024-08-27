
import 'semantic-ui-css/semantic.min.css';
import React, { useEffect, useRef, useState } from 'react';
import { Container, Segment, Header, Button, Label, Icon } from 'semantic-ui-react';
import { WEBSOCKET_URL, API_COMMAND_TEMPLATE} from '../../AppConfig';

function Remote({name, apiCommands, websocketEventHandler=()=>{}}) {
    const [state, setState] = useState('disconnected');
    const [message, setMessage] = useState('');

    const ws = useRef(null);

    // Function to set up WebSocket event listeners
    const setupWebSocket = () => {
        if (!ws.current) return;

        ws.current.onopen = () => {
            ws.jsend({event: 'greeting', name: name})
            setState('connected');
        };

        ws.current.onmessage = (event) => {
            setMessage(event.data);

            try {
                const data = JSON.parse(event.data);
                websocketEventHandler(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
            
        };

        ws.current.onclose = () => {
            setState('disconnected');
        };
        
        ws.jsend = (msg)=>{
            if(ws.current && ws.current.readyState === WebSocket.OPEN){
                ws.current.send(JSON.stringify(msg));
            }else{
                console.error('WebSocket is not open');
            }
        }
        ws.api_send = (command, params={}) =>{
            const jsonObj = API_COMMAND_TEMPLATE;
            jsonObj.api.command = command;
            jsonObj.api.params = params;
            console.log("SENDING: ", jsonObj);
            ws.jsend(jsonObj);
        }
    };

    useEffect(() => {
        // Open WebSocket connection and set up listeners
        ws.current = new WebSocket(WEBSOCKET_URL);
        setupWebSocket();

        // Clean up on component unmount
        return () => {
            ws.current.close();
        };
    }, []);

    const connect = () => {
        if (state === 'connected') return;

        ws.current = new WebSocket(WEBSOCKET_URL);
        setupWebSocket();
    };

    const disconnect = () => {
        if (state === 'disconnected') return;

        ws.current.close();
    };

    return (
       
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
                <Button.Group vertical>
                {apiCommands?.map(({ command, label, pattern }) => (
                    <Button color='blue' key={command} onClick={() => ws.api_send('VIBRATE', {command, pattern})}>
                        {label}
                    </Button>
                ))}
                    
                </Button.Group>

                <br></br>
                <br></br>
                <Button color="blue" onClick={()=>ws.api_send('SERVER_STATE')}> SERVER STATE </Button>
                <Button color="green" onClick={connect} disabled={state === 'connected'}>
                    <Icon name="plug" /> Connect
                </Button>
                <Button color="red" onClick={disconnect} disabled={state === 'disconnected'}>
                    <Icon name="power off" /> Disconnect
                </Button>
            </Segment>
 
    );
}

export {Remote};
