import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import * as Tone from 'tone';

const SynthManager = forwardRef((props, ref) => {
  const gainNodeRef = useRef(null);
  const currentNotesRef = useRef(new Set());
  const synthRef = useRef(null);
  const isPlayingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    playSynthChord,
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
  
    const notes = ["B3", "D4", "F4", "A4", "C5", "E5", "G5"];
    let desiredNotes = [];
  
    // Map the value from 0-100 to the number of notes to play
    const numNotes = Math.floor((value / 100) * notes.length);
  
    if (numNotes > 0) {
      desiredNotes = [notes[numNotes]];
      // desiredNotes = notes.slice(0, numNotes);
    } else {
      desiredNotes = [notes[0]];
    }
  
    // const notesToStop = currentNotesRef
    const notesToStop = [...currentNotesRef.current].filter(item => !desiredNotes.includes(item));
    notesToStop.forEach(oldNote => releaseNote(oldNote));
    
    
    const newNotes = desiredNotes.filter(item => ![...currentNotesRef.current].includes(item));
    newNotes.forEach(newNote => triggerNote(newNote));
  };

  const playSynthLinear = (value) => {
    if (value < 0 || value > 100) {
      stop();
      return;
    }
  
    const notes = ["B3", "D4", "F4", "A4", "C5", "E5", "G5"];
    let desiredNotes = [];
  
    // Map the value from 0-100 to the number of notes to play
    // const numNotes = Math.floor((value / 100) * notes.length);
  
    if (value > 0) {
      desiredNotes.push(246.9 + value * 3);
      // desiredNotes = notes.slice(0, numNotes);
    } else {
      desiredNotes = [notes[0]];
    }
    console.log(desiredNotes);
  
    // const notesToStop = currentNotesRef
    // const notesToStop = [...currentNotesRef.current].filter(item => !desiredNotes.includes(item));
    // notesToStop.forEach(oldNote => releaseNote(oldNote));
    const notesToStop = [desiredNotes.slice(0, desiredNotes.length-1)];
    console.log(notesToStop);
    notesToStop.forEach(oldNote => releaseNote(oldNote));
    
    // const newNotes = desiredNotes.filter(item => ![...currentNotesRef.current].includes(item));
    const newNotes = [desiredNotes[desiredNotes.length - 1]];
    newNotes.forEach(newNote => triggerNote(newNote));
  };

  const playSynthChord = (value) => {
    if (value < 0 || value > 100) {
      stop();
      return;
    }
  

    // const layer0 = ["C4",  "D4", "G4"];
    // const layer1 = ["E4", "G4", "A4", "D5"];
    // const layer2 = ["A4", "C5", "E5"];
    // const layer3 = ["G4", "B4", "D5", "G5"];
    // const layer4 = ["C5", "D5", "G5", "A5"];
    // const layer5 = ["E5", "G5", "A5", "C6", "D6"];
    // const base = ["E3", "F3", "D4"];
    const layer0 = ["C3", "D4", "A4"];
    const layer1 = ["A3", "C4", "E5"];
    const layer2 = ["E3", "C4", "B5"];
    const layer3 = ["G3", "B4", "D5", "G5"];
    const layer4 = ["C4", "D5", "G5", "A5"];
    const layer5 = ["E4", "G5", "A5", "C6", "D6"];
    const base   = ["E2", "F3", "D4"];


    const chords = [base, layer0, layer1, layer2, layer3, layer4, layer5]

    let desiredNotes = [];
  
    // Map the value from 0-100 to the number of notes to play
    const numNotes = Math.floor((value / 100) * (chords.length));
  
    if (numNotes > 0) {
      if (numNotes == chords.length) {
        desiredNotes = chords[6];
      }
      else{
        desiredNotes = chords[numNotes];
      }
      // desiredNotes = notes.slice(0, numNotes);
    } else {
      desiredNotes = chords[0];
    }
    console.log(desiredNotes);
  
    // const notesToStop = currentNotesRef
    const notesToStop = [...currentNotesRef.current].filter(item => {
      // console.log("Checking if desiredNotes includes:", item);
      if (!Array.isArray(desiredNotes)) {
        console.warn("desiredNotes is not defined or not an array:", desiredNotes);
        return false;
      }
      return !desiredNotes.includes(item);
    });
    notesToStop.forEach(oldNote => releaseNote(oldNote));
  
    
  const newNotes = Array.isArray(desiredNotes)? desiredNotes.filter(item => {
      console.log("Checking if currentNotes includes:", item);
      const currentNotes = [...(currentNotesRef.current || [])];
      return !currentNotes.includes(item);
    })
  : [];

    newNotes.forEach(newNote => triggerNote(newNote));
  };

  const playOctaveSynth = (level) => {
    if (level < 0) return;
    const notes = ["C3", "D4", "F4", "A4", "C5", "E5", "G5"];
    let desiredNotes = [];
    if (level > 10) {
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
      synthRef.current.triggerAttackRelease(note, "1n");
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
SynthManager.displayName = 'SynthManager';
export default SynthManager;