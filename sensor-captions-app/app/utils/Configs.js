import React, { createContext, useState } from 'react';

// Create the context
export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState({
    useSynth: false,
    useLight: false,
    useVibrate: false,
    useKitchen: false,
  });

// export const [config, setConfig] = useState({
//     useSynth: false,
//     useLight: false,
//     useVibrate: false,
//     useKitchen: false,
//   });

 const handleCheckboxChange = (event) => {
    console.log(event);
    const {name, checked} = event.target;
    console.log(checked);
    setConfig( prevState => ({
      ...prevState,
      [name]: checked,
    }));
    console.log("After: "+ checked);
  }; 

  return (
    <ConfigContext.Provider value = {{config, handleCheckboxChange}}>
        {children}
    </ConfigContext.Provider>
  );
};

