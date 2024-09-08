import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Ribbon = ({ modes, isActive, setIsActive, typeSelect }) => {
  const handleIconClick = (index) => {
    const selectedMode = modes[index];

    if (typeSelect === 'single') {
      // Single-select: Only the clicked mode is active
      setIsActive([selectedMode]);
    } else if (typeSelect === 'multi') {
      // Multi-select: Toggle the clicked mode's active state
      const isModeActive = isActive.some(mode => mode.value === selectedMode.value);
      if (isModeActive) {
        // Remove the mode from active modes
        setIsActive(isActive.filter(mode => mode.value !== selectedMode.value));
      } else {
        // Add the mode to active modes
        setIsActive([...isActive, selectedMode]);
      }
    }
  };

  return (
    <div className="flex w-full pb-3 pt-3 justify-around shadow-md">
      {modes?.map((mode, index) => {
        const isModeActive = isActive.some(activeMode => activeMode.value === mode.value);
        return (
          <div
            key={index}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleIconClick(index)}
          >
            <div
              className={classNames(
                'flex justify-center items-center w-12 h-12 rounded-full border-2',
                {
                  'border-[#2A3659]': isModeActive,
                  'border-[#BAC1CB]': !isModeActive,
                }
              )}
            >
              <FontAwesomeIcon
                icon={mode.icon}
                style={{
                  color: isModeActive ? '#2A3659' : '#BAC1CB',
                  fontSize: '24px',
                }}
              />
            </div>
            <div className="mt-2 text-sm text-black">{mode.label}</div>
          </div>
        );
      })}
    </div>
  );
};

Ribbon.propTypes = {
  modes: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.elementType.isRequired, // Icon for the mode
      label: PropTypes.string.isRequired, // Label for the mode
      value: PropTypes.string.isRequired, // Unique identifier for the mode
    })
  ).isRequired,
  isActive: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired, // Ensure active modes have a value property
    })
  ).isRequired,
  setIsActive: PropTypes.func.isRequired,
  typeSelect: PropTypes.oneOf(['single', 'multi']).isRequired, // Ensure typeSelect is either 'single' or 'multi'
};

export default Ribbon;
