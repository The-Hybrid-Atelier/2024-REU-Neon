import React, { useState } from 'react';
import { Segment, Button, Icon } from 'semantic-ui-react';

const CollapsibleSegment = ({ title, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div>
      <Segment basic>
        <Button onClick={toggleCollapse} fluid>
          <Icon name={isCollapsed ? 'angle down' : 'angle up'} />
          {title}
        </Button>
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
