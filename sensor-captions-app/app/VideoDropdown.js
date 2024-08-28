import React from 'react';
import { Dropdown as SemanticDropdown } from 'semantic-ui-react'; // Rename the import
import './neon.css';

const dropDownVals = [
  { key: 1, text: 'l-bend-001', value: 1 },
  { key: 2, text: 'u-bend-001', value: 2 },
];

const VideoDropdown = ({ onDropDown }) => (
  <SemanticDropdown 
    clearable 
    options={dropDownVals} 
    selection 
    onChange={(e, { value }) => onDropDown(value)} 
  />
);

export default VideoDropdown;  // Export your custom component
