'use client';
import 'semantic-ui-css/semantic.min.css';
import React from 'react';
import { Container } from 'semantic-ui-react';
import BLEOSCInterface from './BLEOSCInterface'; // Assuming it's a default export now

function BLEApp() {
  const receiverCallback = (data) => {
    console.log("Received data from BLE:", data);
  };

  return (
    <Container textAlign="center" style={{ marginTop: '50px' }}>
      <BLEOSCInterface receiverCallback={receiverCallback} />
    </Container>
  );
}

export default BLEApp;
