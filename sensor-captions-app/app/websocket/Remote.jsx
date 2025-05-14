import 'semantic-ui-css/semantic.min.css';
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Container, Checkbox, Segment, Header, Button, Label, Icon } from 'semantic-ui-react';
import { WEBSOCKET_URL, API_COMMAND_TEMPLATE } from '../../AppConfig';
import CollapsibleSegment from '../utils/CollapsibleSegment';

const Remote = forwardRef(({ settings, collapsible, children, name, apiCommands, websocketEventHandler = () => { } }, ref) => {
    const [state, setState] = useState('disconnected');
    const [message, setMessage] = useState('');

    const ws = useRef(null);

    // Function to set up WebSocket event listeners
    const setupWebSocket = () => {
        if (!ws.current) return;

        ws.current.onopen = () => {
            ws.jsend({ event: 'greeting', name: name });
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

        ws.jsend = (msg) => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify(msg));
            } else {
                console.error('WebSocket is not open');
            }
        };

        ws.api_send = (command, params = {}) => {
            const jsonObj = API_COMMAND_TEMPLATE;
            jsonObj.api.command = command;
            jsonObj.api.params = params;
            console.log("SENDING: ", jsonObj);
            ws.jsend(jsonObj);
        };
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

    useImperativeHandle(ref, () => ({
        jsend: (msg) => {
            if (ws.current) {
                ws.jsend(msg);
            } else {
                console.error('WebSocket is not initialized');
            }
        }
    }));

    const handleToggle = () => {
        if (state === 'connected') {
            disconnect();
        } else {
            connect();
        }
    };

    const connect = () => {
        if (state === 'connected') return;
        ws.current = new WebSocket(WEBSOCKET_URL);
        setupWebSocket();
    };

    const disconnect = () => {
        if (state === 'disconnected') return;
        ws.current.close();
    };

    const header = (
        <div className="w-full flex flex-row justify-between items-center p-2">
            <div className="flex flex-row justify-start items-center">
                <div className={`mr-2 rounded-2xl ${state === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} style={{ height: '20px', width: '20px' }} />
                <span className="font-bold text-lg">{name}</span>
            </div>
        </div>
    );

    const ws_settings_contents = (
        <div className="p-5">
            <Checkbox
                toggle
                color="green"
                checked={state === "connected"}
                onChange={handleToggle}
                labelPosition="left"
                label={state === "connected" ? 'Disconnect' : 'Connect'}
            />
            <Segment>
                <Header as="h4">Latest Message</Header>
                <p>{message || 'No messages received yet'}</p>
            </Segment>
            <Button size="mini" color="blue" onClick={() => ws.api_send('SERVER_STATE')}> SERVER STATE </Button>
            {state === "connected"}
            <Button.Group vertical>
                {apiCommands?.map(({ command, label, pattern }) => (
                    <Button color='blue' key={command} onClick={() => ws.api_send('VIBRATE', { command, pattern })}>
                        {label}
                    </Button>
                ))}
            </Button.Group>
        </div>
    );
    const ws_settings = (
        <>
            <CollapsibleSegment level={2} header="Websocket Settings" startCollapsed={true} settings={ws_settings_contents} collapsible={false} />
            {settings && settings.map((setting, index) => (
                setting.viewable ? <CollapsibleSegment key={index} level={2} header={`${setting.name}`} startSettingCollapsed={setting.startSettingCollapsed} settings={setting.view} collapsible={false} /> : <></>
            ))}
        </>
    );
    return (
        <CollapsibleSegment header={header} settings={ws_settings} icon="setting" startCollapsed={false} collapsible={collapsible}>
            {children}
        </CollapsibleSegment>
    );
});

Remote.displayName = 'Remote'; // Set display name for debugging
export { Remote };
