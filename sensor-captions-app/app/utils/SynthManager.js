import * as Tone from 'tone';

class SynthManager {
  constructor() {
    this.currentNotes = new Set();
    const gainNode = new Tone.Gain(0.5).toDestination();
    this.synth = new Tone.PolySynth(Tone.Synth,{
        envelope: {
        attack: 0.1, // Time for the attack phase
        decay: 0.2, // Time for the decay phase
        sustain: 0.9, // Sustain level
        release: 0.5 // Time for the release phase (fade out)
        }
    }).connect(gainNode);
    console.log("Synth loaded");
  }

  playSynth = (value) => {
    const notes = ["F5", "D4", "F4", "A4", "C5", "E5", "G5"]; 
    let desiredNotes = [];
    if (value > 6) {
        if (value % 6 == 0) {
          desiredNotes = notes.slice(0, (value - 6));
        } else {
          desiredNotes = notes.slice(-(value-5));
        }
    } else {
        desiredNotes = [] + notes[value];
    }
    console.log("desiredNotes: " + desiredNotes);
    const notesToStop = Array.from(this.currentNotes).filter(item => !desiredNotes.includes(item));
    notesToStop.forEach(oldNote => {
        this.releaseNote(oldNote);
    });
    const newNotes = desiredNotes.filter(item => !(Array.from(this.currentNotes).includes(item)));
    newNotes.forEach(newNote => {
        console.log(newNote);
        this.triggerNote(newNote);
    });
  };
  triggerNote = (note) => {
    this.synth.triggerAttack(note);
    this.currentNotes.add(note);
    console.log(`Playing: ${note}`);
    this.logCurrentNotes();
  }

  releaseNote = (note) => {
    this.synth.triggerRelease(note);
    this.currentNotes.delete(note);
    console.log(`Released: ${note}`);
    this.logCurrentNotes();
  };

  logCurrentNotes = () => {
    console.log('Current Notes Playing:', Array.from(this.currentNotes));
  };

  getCurrentNotes = () => {
    return Array.from(this.currentNotes);
  };

  dispose = () => {
    this.synth.dispose();
  };
}

const synthManager = new SynthManager();

export { synthManager };
