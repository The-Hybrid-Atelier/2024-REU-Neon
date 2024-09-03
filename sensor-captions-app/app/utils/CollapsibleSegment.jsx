import React, { useState } from 'react';
import { Segment, Button, Icon } from 'semantic-ui-react';

const CollapsibleSegment = ({ title, header, children, icon="caret" }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className='bg-white'>
      <Segment basic>
        <div className="flex flex-row justify-between items-center">
          {header ? header : (
              <span>{title}</span>
          )}
          <Button className="!ml-5" circular icon basic onClick={toggleCollapse}>
            {icon === "caret" && <Icon name={isCollapsed ? 'caret down' : 'caret up'} /> }
            {icon === "setting" && <Icon name={isCollapsed ? 'setting' : 'setting active'} /> }
          </Button>
        </div>
        {!isCollapsed && (
          <div style={{ marginTop: '1rem' }}>
            {children}
          </div>
        )}
          
      </Segment>
    </div>
  );
};

export default CollapsibleSegment;
