// components/HowlerPlayer.js
import { Howl } from 'howler';
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const HowlerPlayer = forwardRef(({ src }, ref) => {
//const HowlerPlayer = ({ src }) => {
  const soundRef = useRef(null);

  useEffect(() => {
    soundRef.current = new Howl({
      src: [src],
      onload: () => console.log("Audio loaded"),
      onloaderror: (id, err) => console.error("Error loading audio", err),
    });

    return () => {
      soundRef.current.unload();
    };
  }, [src]);

  useImperativeHandle(ref, () => ({
    playAudio: () => {
      console.log(src);
      soundRef.current.play();
    },
  }));

  // const playAudio = () => {
  //   console.log(src);
  //   soundRef.current.play();
  // };

  // const pauseAudio = () => {
  //   soundRef.current.pause();
  // };

  return null;

  // return (
  //   <div>
  //     <button onClick={playAudio}>Play</button>
  //     <button onClick={pauseAudio}>Pause</button>
  //   </div>
  // );
});

export default HowlerPlayer;