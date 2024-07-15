// pages/api/esp32/status.js
export default async function handler(req, res) {
    //const response = await fetch('ws://${window.location.hostname}/ws');http://192.168.1.79/
    const response = await fetch('http://192.168.1.79/');
    console.log()
    const text = await response.text();
    const data = JSON.parse(text);
    const pressure = data.pressure;
    res.status(200).json({ message: pressure });
  }
  