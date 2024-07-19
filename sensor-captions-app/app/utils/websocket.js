// utils/websocket.js

let websocket;

export const initWebSocket = () => {
    const gateway = `ws://192.168.1.79/ws`;

    websocket = new WebSocket(gateway);
    console.log('Trying to open a WebSocket connection…');

    websocket.onopen = () => {
        console.log('WebSocket connection opened');
        getReadings();
    };

    websocket.onclose = () => {
        console.log('WebSocket connection closed');
        setTimeout(initWebSocket, 2000);
    };

    websocket.onmessage = (event) => {
        console.log(event.data);
        const myObj = JSON.parse(event.data);
        const keys = Object.keys(myObj);

        // keys.forEach((key) => {
        //     document.getElementById(key).innerHTML = myObj[key];
        // });
    };

    return websocket; // Return websocket instance
};


export const vibrate = (value) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send('vibrate' + value);
    } else {
        console.error('WebSocket is not open');
    }
};

export const light = (curr, next, duration) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send('light' + curr + "," + next + "," + duration);
       
    } else {
        console.error('WebSocket is not open');
    }
};

export const getReadings = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send('getReadings');
    } else {
        console.error('WebSocket is not open');
    }
};

export const collectData = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send('collect');
    } else {
        console.error('WebSocket is not open');
    }
}