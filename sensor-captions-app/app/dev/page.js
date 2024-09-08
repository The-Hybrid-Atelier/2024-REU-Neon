'use client';

import React, { useState } from 'react';
import Ribbon from './Ribbon';
import Collapsable from './Collapsable';
import Slider from './Slider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNodes, faGoogle } from '@fortawesome/free-solid-svg-icons';

function DevApp() {
  const [isActive, setIsActive] = useState([true, false, false]); // Adjusted to match number of icons
  const typeSelect = 'single'; // Set to 'single' or 'multi' based on desired behavior
  const icons = [faCircleNodes, faCircleNodes, faCircleNodes];
  const labels = ['GOOGLE', 'PHONE', 'Ipad'];

 

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Ribbon Component */}
      
      <div className="p-4 w-full">
        <Ribbon 
          icons={icons} 
          labels={labels} 
          isActive={isActive} 
          setIsActive={setIsActive}
          typeSelect={typeSelect}
        />
      </div>
     

      {/*
      <div className="p-4">
        <Slider title="COMPLETION"/>
      </div>
      */}

      <div className="p-4">
        <Collapsable 
          isConnected={true} 
          title="input" 
          isMenuOpen={true} 
        />
      </div>

    </div>
  );
}

export default DevApp;
