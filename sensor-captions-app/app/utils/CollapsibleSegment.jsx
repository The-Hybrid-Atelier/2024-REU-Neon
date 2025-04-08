import React, { useState } from 'react';
import { Segment, Button, Icon } from 'semantic-ui-react';

const CollapsibleSegment = ({ title, level=1, header, children, settings=false, icon="caret", startCollapsed=true, startSettingCollapsed=true, collapsible=true}) => {
  const [isSetttingsCollapsed, setIsSetttingsCollapsed] = useState(startSettingCollapsed);
  const [isCollapsed, setIsCollapsed] = useState(startCollapsed);

  return (
      <div className='collapsible-segment w-full h-full'>
        <div className={`collapsible-segment header ${level === 1 ? " p-2 ": "p-1 bg-white border rounded"} flex border flex-row justify-between items-center p-3`}>
          {header ? header : (
              <span className="font-bold text-md pl-5 italic">{title}</span>
          )}
          <div className='collapsible-segment header icons flex flex-row items-center justify-center'>
            { settings && (
              <Button className="!ml-5" circular icon basic onClick={(prevState)=> setIsSetttingsCollapsed(!isSetttingsCollapsed)}>
                <Icon name={isSetttingsCollapsed ? 'setting' : 'setting active'} />
              </Button>
            )}
             { collapsible && (
              <Button circular icon basic onClick={(prevState)=> setIsCollapsed(!isCollapsed)}>
                <Icon name={isCollapsed ? 'caret down' : 'caret up'} />
              </Button>
            )}
          </div>
        </div>
        {settings && !isSetttingsCollapsed && (
          <div className={`setttings ${level === 1 ? "bg-gray-100 p-5":"bg-white"}`}>
            {settings}
          </div>
        )}
        {(!collapsible || !isCollapsed) && (
          <div className="h-full">
            {children}
          </div>
        )}
          
      </div>
  );
};

export default CollapsibleSegment;
