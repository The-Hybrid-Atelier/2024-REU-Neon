import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Icon, Form, FormField} from 'semantic-ui-react';

const RibbonDropdown = ({ modes, isActive, setIsActive, typeSelect, label = "Label" }) => {
  const handleChange = (_, data) => {
    if (typeSelect === 'single') {
      const selected = modes.find(m => m.value === data.value);
      setIsActive(selected ? [selected] : []);
    } else {
      const selectedModes = modes.filter(m => data.value.includes(m.value));
      setIsActive(selectedModes);
    }
  };
  

  const dropdownOptions = modes.map(mode => ({
    key: mode.value,
    text: (
      <div className="flex items-center">
        {mode.icon && <Icon name={mode.icon} className="mr-2" />}
        {mode.label}
      </div>
    ),
    value: mode.value,
  }));

  return (
    <Form.Field className="w-full px-7 py-3">
      <label className="text-sm font-bold text-gray-700 mb-2 block">{label}</label>
      <Dropdown
        fluid
        selection
        multiple={typeSelect === 'multi'}
        options={dropdownOptions}
        value={
          typeSelect === 'multi'
            ? isActive.map(mode => mode.value)
            : isActive[0]?.value || null
        }
        onChange={handleChange}
        placeholder="Select mode"
      />
    </Form.Field>
  );
};

RibbonDropdown.propTypes = {
  modes: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string, // must be a valid Semantic UI icon name
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  isActive: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  setIsActive: PropTypes.func.isRequired,
  typeSelect: PropTypes.oneOf(['single', 'multi']).isRequired,
};

export default RibbonDropdown;
