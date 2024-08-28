import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import * as Tone from 'tone';

const SynthManager = forwardRef((props, ref) => {
  const gainNodeRef = useRef(null);
  const currentNotesRef = useRef(new Set());
  const synthRef = useRef(null);
  const isPlayingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    playSynth,
    toggleMute,
    setVolume,
    pause,
    resume,
    stop,
    getIsPlaying,
  }));

  const playSynth = (value) => {
    if (value < 0 || value > 100) {
      stop();
      return;
    }
  
    const notes = ["F5", "D4", "F4", "A4", "C5", "E5", "G5"];
    let desiredNotes = [];
  
    // Map the value from 0-100 to the number of notes to play
    const numNotes = Math.floor((value / 100) * notes.length);
  
    if (numNotes > 0) {
      desiredNotes = notes.slice(0, numNotes);
    } else {
      desiredNotes = [notes[0]];
    }
  
    const notesToStop = [...currentNotesRef.current].filter(item => !desiredNotes.includes(item));
    notesToStop.forEach(oldNote => releaseNote(oldNote));
  
    const newNotes = desiredNotes.filter(item => ![...currentNotesRef.current].includes(item));
    newNotes.forEach(newNote => triggerNote(newNote));
  };

  const playOctaveSynth = (level) => {
    if (level < 0) return;
    const notes = ["F5", "D4", "F4", "A4", "C5", "E5", "G5"];
    let desiredNotes = [];
    if (level > 6) {
      desiredNotes = level % 6 === 0 ? notes.slice(0, (level - 6)) : notes.slice(-(level - 5));
    } else {
      desiredNotes = [notes[level]];
    }
  
    // Adjust voicing for higher levels
    if (level > 50) {
      desiredNotes = desiredNotes.map(note => `${note[0]}${parseInt(note[1]) + 1}`); // Shift up an octave
    }
    
    const notesToStop = Array.from(currentNotesRef.current).filter(note => !desiredNotes.includes(note));
    notesToStop.forEach(note => releaseNote(note));
    
    const newNotes = desiredNotes.filter(note => !currentNotesRef.current.has(note));
    newNotes.forEach(note => triggerNote(note));
  };
  
  const triggerNote = (note, keep) => {
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
      // addHarmonics(note);  // Add harmonics when the note is triggered
      if (!keep) {
        currentNotesRef.current.add(note);
      }
      isPlayingRef.current = true;
    }
  };
  
  const addHarmonics = (note) => {
    // Example: Add an octave above and below the current note
    const harmonics = [
      `${note[0]}${parseInt(note[1]) + 1}`,  // Octave above
      `${note[0]}${parseInt(note[1]) - 1}`   // Octave below
    ];
    
    harmonics.forEach((harmonic) => {
      synthRef.current.triggerAttack(harmonic);
    });
  };
  
  const releaseNote = (note, keep) => {
    if (synthRef.current) {
      synthRef.current.triggerRelease(note);
      if (!keep) {
        currentNotesRef.current.delete(note);
      }
    }
  };

  const toggleMute = () => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gainNodeRef.current.gain.value === 0 ? 0.5 : 0;
    }
  };

  const setVolume = (value) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = value;
    }
  };

  const pause = () => {
    isPlayingRef.current = false;
    currentNotesRef.current.forEach(oldNote => {
      releaseNote(oldNote, true);
    });
  };

  const resume = () => {
    currentNotesRef.current.forEach(oldNote => {
      triggerNote(oldNote, true);
    });
    isPlayingRef.current = true;
  };

  const stop = () => {
    isPlayingRef.current = false;
    currentNotesRef.current.forEach(oldNote => {
      releaseNote(oldNote);
    });
  };

  const getIsPlaying = () => {
    return isPlayingRef.current;
  };

  // const initSynth = () => {
  //   const gainNode = new Tone.Gain(0.25).toDestination();
  //   gainNodeRef.current = gainNode;
  //   synthRef.current = new Tone.PolySynth(Tone.Synth).connect(gainNode);
  // };
  const initSynth = () => {
    const gainNode = new Tone.Gain(0.25).toDestination();
    gainNodeRef.current = gainNode;
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' }, // You can experiment with other types like 'square' or 'triangle'
      envelope: {
        attack: 0.2,   // Adjust for slower/faster attack
        decay: 0.2,    // Decay time
        sustain: 0.5,  // Sustain level
        release: 1.5,  // Adjust for smoother release
      },
    }).connect(gainNode);
  };

  const startAudioContext = () => {
    Tone.start().then(() => {
      console.log('Tone.js started');
      initSynth();
    });
  };

  useEffect(() => {
    // Add an event listener to start the audio context on user interaction
    const handleUserGesture = () => {
      startAudioContext();
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };

    window.addEventListener('click', handleUserGesture);
    window.addEventListener('keydown', handleUserGesture);

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();  // Properly dispose of the synth
      }
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
  }, []);

  return null;
});

export default SynthManager;