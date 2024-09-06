import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNodes, faGoogle } from '@fortawesome/free-solid-svg-icons';

const Ribbon = ({ icons, labels, isActive, onIconClick, typeSelect }) => {
  return (
    <div className="flex w-full justify-around">
      {icons.map((Icon, index) => (
        <div
          key={index}
          className="flex flex-col items-center cursor-pointer"
          onClick={() => onIconClick(index)}
        >
          <div
            className={classNames(
              'flex justify-center items-center w-12 h-12 rounded-full border-2',
              {
                'border-[#2A3659]': isActive[index],
                'border-[#BAC1CB]': !isActive[index],
              }
            )}
          >
            <FontAwesomeIcon
              icon={Icon}
              style={{
                color: isActive[index] ? '#2A3659' : '#BAC1CB', // Sets the icon color
                fontSize: '24px' // Adjust the icon size as needed
              }}
            />
          </div>
          <div className="mt-2 text-sm text-black">{labels[index]}</div>
        </div>
      ))}
    </div>
  );
};

Ribbon.propTypes = {
  icons: PropTypes.arrayOf(PropTypes.elementType).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  isActive: PropTypes.arrayOf(PropTypes.bool).isRequired,
  onIconClick: PropTypes.func.isRequired,
  typeSelect: PropTypes.oneOf(['single', 'multi']).isRequired, // Ensure typeSelect is either 'single' or 'multi'
};

export default Ribbon;
