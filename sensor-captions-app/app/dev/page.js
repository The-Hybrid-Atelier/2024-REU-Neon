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

  const handleIconClick = (index) => {
    if (typeSelect === 'single') {
      // Single-select: Only the clicked icon is active
      const newIsActive = icons.map((_, i) => i === index);
      setIsActive(newIsActive);
    } else if (typeSelect === 'multi') {
      // Multi-select: Toggle the clicked icon's active state
      const newIsActive = [...isActive];
      newIsActive[index] = !newIsActive[index];
      setIsActive(newIsActive);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Ribbon Component */}
      <div className="p-4 w-full">
        <Ribbon 
          icons={icons} 
          labels={labels} 
          isActive={isActive} 
          onIconClick={handleIconClick} 
          typeSelect={typeSelect}
        />
      </div>

      <div className="p-4">
        <Slider title="COMPLETION"/>
      </div>

    </div>
  );
}

export default DevApp;
