import React from 'react';
import { Dropdown as SemanticDropdown } from 'semantic-ui-react'; 

const IFTTTdropdown = ({ value, onChange, dropDownVals }) => (
  <SemanticDropdown 
    clearable 
    options={dropDownVals} 
    selection 
    value={value} // Ensure the dropdown shows selected value
    onChange={(e, { value }) => onChange(value)} // Use function, not array indexing
  />
);

export default IFTTTdropdown;