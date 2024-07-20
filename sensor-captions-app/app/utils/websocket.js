// utils/websocket.js

const jsonObject = {
    device: "",
    version: "1.0",
    playbackSpeed: 1.0,
    api: {
        command: "",
        params: {
            
        }
    }
};

let websocket;

export const initWebSocket = () => {
    const gateway = `ws://192.168.1.79/ws`; // atelier
    //const gateway = 'ws://192.168.25.1/ws'; // RohitaK

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
        jsonObject.device = "haptic";
        jsonObject.api.command = "vibrate";
        jsonObject.api.params["intensity"] = value;
        const jsonString = JSON.stringify(jsonObject);
        websocket.send(jsonString);
        console.log(jsonString);
    } else {
        console.error('WebSocket is not open');
    }
};

export const light = (curr, next, dur) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        jsonObject.device = "LED";
        jsonObject.api.command = "light";
        jsonObject.api.params["curr_intensity"] = curr;
        jsonObject.api.params["next_intensity"] = next;
        jsonObject.api.params["duration"] = dur;
        const jsonString = JSON.stringify(jsonObject);
        websocket.send(jsonString);
        console.log(jsonString);
       //light10,11,300
    } else {
        console.error('WebSocket is not open');
    }
};

export const getReadings = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        jsonObject.device = "Pressure Sensor";
        jsonObject.api.command = "getReadings";
        const jsonString = JSON.stringify(jsonObject);
        websocket.send(jsonString);
        console.log(jsonString);
    } else {
        console.error('WebSocket is not open');
    }
};

export const collectData = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        jsonObject.device = "Pressure Sensor";
        jsonObject.api.command = "collect";
        const jsonString = JSON.stringify(jsonObject);
        websocket.send(jsonString);
        console.log(jsonString);
    } else {
        console.error('WebSocket is not open');
    }
}