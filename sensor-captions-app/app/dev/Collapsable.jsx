import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';

const Collapsable = ({ isConnected, title, isMenuOpen, MenuComponent }) => {
  // Define the color based on the isConnected prop
  const circleColor = isConnected ? '#2A7F31' : '#E21C1C';
  const menuColor = isMenuOpen ? '#2A3659' : '#BAC1CB';

  return (
    <div className="w-screen">
      {/* Main Menu Bar */}
        <div className="flex items-center pl-4 pr-4">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: circleColor }}
          ></div>
          <div
            className="ml-5 text-left"
            style={{ fontFamily: "Arial", fontSize: "14pt", fontWeight: "bold" }}
          >
            {title}
          </div>

          <div
            className="ml-auto flex w-10 h-10 rounded-full border-2 items-center justify-center"
            style={{ backgroundColor: '#ffffff', borderColor: menuColor }}
          >
            <FontAwesomeIcon
              icon={faGear}
              style={{
                color: menuColor,
                fontSize: '18px',
              }}
            />
          </div>
        </div>
    </div>
  );
};

export default Collapsable;
