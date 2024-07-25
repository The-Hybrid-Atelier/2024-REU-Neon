// pages/synth.js

import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';

//12 =  all + F5 instead of G5, 11 = all, A4 is a dummy slot

let synth;
let currNotes;

export const initSynth = () => {
  const gainNode = new Tone.Gain(0.5).toDestination();
  synth = new Tone.PolySynth(Tone.Synth,{
    envelope: {
      attack: 0.1, // Time for the attack phase
      decay: 0.2, // Time for the decay phase
      sustain: 0.9, // Sustain level
      release: 0.5 // Time for the release phase (fade out)
    }
  }).connect(gainNode);
  console.log("Synth loaded");
   
}

export const playSynth = (value, duration) =>  {
  // synth.dispose();
  // initSynth();
  duration -= 100;
  if (duration < 3000) {
    duration /= 1000;
    console.log("playing synth");
    
    const notes = ["F5", "D4", "F4", "A4", "C5", "E5", "G5"]; 
    //const noteDelay = [0.1,0.2,0.3,0.4,0.5]; 
    if (value > 6) {
      if (value % 6 == 0) {
        currNotes = notes.slice(0, (value - 6));
      } else {
        currNotes = notes.slice(1);
      }
      
      synth.triggerAttackRelease(currNotes,  duration);
    } else {
      const notesToRemove = currNotes.filter(notes[value]);
      currNotes = notes[value];
      synth.triggerRelease(notesToRemove);
      synth.triggerAttack(currNotes, duration);
    }
}
  

}




//   return (
//     <div>
//       <h1>Tone.js Synth in Next.js</h1>
//       <button
//         onClick={() => {
//           // Create a synth and connect it to the main output (your speakers)
          
//           const now = Tone.now();
//           playSynth(Math.floor(Math.random() * 12), 0.5);
//           // Play a note triggered by button click
          
//         }}
//       >
//         Play Note
//       </button>
//       <button
//         onClick={() => {
          

//         }}
//       >Stop Synth</button>
//     </div>
//   );
// };

// export default SynthPage;
