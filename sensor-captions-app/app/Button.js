/*
Defines a general button component that can be given a functionality

TO-DO:
2. Connect each button with a functionality from VideoJS.js

*/

import React, {useState} from 'react';
import { Button } from 'semantic-ui-react' //use to create circular buttons on page


//click indicates if the button was clicked (0 or 1), input indicates the type of input that should be turned on and
//onClick is a function in VideoJS.js that ensures that that input is turned on



const IconButton = ({ src, alt, clicked, input, onClick}) => (
    <Button
        circular
        icon={<img src={src} alt={alt} />}
        onClick={() => onClick(clicked, input)}  // Trigger the onClick function with the input type
        style={{
            backgroundColor: clicked ? 'blue' : 'gray', // Change the background color if clicked
            borderColor: clicked ? 'black' : 'transparent', // change the border color if clicked
        }}
  />
);

/*const IconButtonPressed = ({ src, alt}) => (
    <Button circular icon={<img src={src} alt={alt} color='blue'/>} />
);*/

/*HTML: <button class="ui circular icon button"><i aria-hidden="true" class="settings icon"></i></button> */

export default IconButton;
