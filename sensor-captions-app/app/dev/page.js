'use client';

import React, {useState} from 'react';
import { Container } from 'semantic-ui-react';
import Toggle from './Toggle';
import Ribbon from './Ribbon';

function DevApp(){
    const [activeElements, setActiveElements] = useState(["light"]);
    const [isOn, setIsOn] = useState(false);
    const elements = ["light", "meter"]


    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            {/* <Toggle labelTrue="On" labelFalse="False" state={isOn} setState={setIsOn}/> */}
            <Ribbon elements={elements} activeElements={activeElements} setActiveElements={setActiveElements} />
        </div>
    )
}


export default DevApp;