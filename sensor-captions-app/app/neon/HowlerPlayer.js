//File related to sound feedback

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Howl } from 'howler';


const HowlerPlayer = forwardRef((props, ref) => {
  const sounds = useRef({
    lightBoiling: new Howl({ src: ['/sounds/light_boiling.wav'], loop: false }),
    bubbling: new Howl({ src: ['/sounds/bubbling.wav'], loop: false }),
    bubblingIntense: new Howl({ src: ['/sounds/bubbling_intense.wav'], loop: false }),
    deepFry: new Howl({ src: ['/sounds/deep_fry.wav'], loop: false }),
    stoveOn: new Howl({ src: ['/sounds/stove_on.mp3'], loop: false }),
    bell: new Howl({ src: ['/sounds/bell.wav'], loop: false }),
  });

  const currentlyPlaying = useRef(null);

  useImperativeHandle(ref, () => ({
    play: (label) => {
      // stop playing sound if ther is any any
      if (currentlyPlaying.current) {
        currentlyPlaying.current.stop();
      }

      const sound = sounds.current[label];
      if (sound) {
        sound.play();
        currentlyPlaying.current = sound;
      }
    },
    loop: (label) => {
      // Stop currently playing sound if any
      if (currentlyPlaying.current) {
        currentlyPlaying.current.stop();
      }

      const sound = sounds.current[label];
      if (sound) {
        sound.loop(true);
        sound.play();
        currentlyPlaying.current = sound;
      }
    }
  }));

  return null;
});

export default HowlerPlayer;
