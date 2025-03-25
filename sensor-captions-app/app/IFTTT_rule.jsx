import React, { useState } from "react";
import IFTTTdropdown from "./IFTTT_dropdown_component";
import Alert from '@mui/material/Alert';

const IFTTTrule = ({ videoLength }) => {
    const [dropdownIfValue, setDropdownIfValue] = useState(null);
    const [dropdownThenValue, setDropdownThenValue] = useState(null);

    const [startTime, setStartTime] = useState({ minutes: "", seconds: "" });
    const [endTime, setEndTime] = useState({ minutes: "", seconds: "" });

    const [isInvalidInput, setInvalidInput] = useState(false)

    const videoMins = Math.floor(videoLength / 60);
    const videoSecs = videoLength % 60;

    const dropDownIf = [
        { key: '1', text: 'Peak', value: 'peak' },
        { key: '2', text: 'Valley', value: 'valley' },
        { key: '3', text: 'Rise', value: 'rise' },
        { key: '4', text: 'Fall', value: 'fall' },
        { key: '5', text: 'Steady', value: 'steady' }
    ];

    const dropDownThen = [
        { key: '1', text: 'Map to Pitch', value: 'map' },
        { key: '2', text: 'Play Beeps', value: 'beeps' },
        { key: '3', text: 'Silence', value: 'silence' },
        { key: '4', text: 'Play Kitchen Sound', value: 'kitchen' }
    ];

    // Handle input changes for start and end times
    const handleInputChange = (event, setState, field) => {
        let value = event.target.value;
    
        // Allow empty input while typing
        setState(prev => ({ ...prev, [field]: value }));
    };
    
    //change the values if they're invalid once they click out 
    const handleInputBlur = (setState, field, timeState) => {
        setState(prev => {
            let newValue = Number(prev[field]);
            let changed = false; // Track if a change occurs

            if (field === "minutes") {
                if (newValue < 0) { newValue = 0; changed = true; }
                if (newValue > videoMins) { newValue = videoMins; changed = true; }
            } else if (field === "seconds") {
                if (newValue < 0) { newValue = 0; changed = true; }
                if (newValue > 59) { newValue = 59; changed = true; }
                if (timeState.minutes == videoMins && newValue > videoSecs) { 
                    newValue = videoSecs; 
                    changed = true; 
                }
            }

            if (changed) setInvalidInput(true); // Show alert if a correction was made
            return { ...prev, [field]: newValue };
        });
    };
    
    

    return (
        <div className="flex relative">
            <div className="flex absolute top-0 left-0 w-full flex justify-center z-50">
                {/* Show Alert Only If Error Exists */}
                {isInvalidInput && (
                    <Alert variant="filled" severity="error" onClose={() => setInvalidInput(false)}>
                        Invalid input value: not in range. Value has been updated to fit video length.
                    </Alert>
                )}

            </div>
            

            <div className="flex flex-row items-center align-center space-x-4">
                <div className="text-black text-xl font-bold font-nunito">If</div>
                <IFTTTdropdown value={dropdownIfValue} onChange={setDropdownIfValue} dropDownVals={dropDownIf} />

                <div className="text-black text-xl font-bold font-nunito">From</div>
                <div className="flex flex-row items-center align-center space-x-4">
                    <input 
                        type="number" 
                        value={startTime.minutes} 
                        onChange={(e) => handleInputChange(e, setStartTime, "minutes")} 
                        onBlur={() => handleInputBlur(setStartTime, "minutes", startTime)}
                        placeholder="Min" 
                        className="text-black w-16 h-8 font-nunito text-md font-bold bg-transparent border text-center flex items-center justify-center"
                    />
                    <div className="text-black text-xl font-bold font-nunito">:</div>
                    <input 
                        type="number" 
                        value={startTime.seconds} 
                        onChange={(e) => handleInputChange(e, setStartTime, "seconds")} 
                        onBlur={() => handleInputBlur(setStartTime, "seconds", startTime)}
                        placeholder="Sec" 
                        className="text-black w-16 h-8 font-nunito text-md font-bold bg-transparent border text-center flex items-center justify-center"
                    />
                </div>

                <div className="text-black text-xl font-bold font-nunito">To</div>
                <div className="flex flex-row items-center align-center space-x-4">
                    <input 
                        type="number" 
                        value={endTime.minutes} 
                        onChange={(e) => handleInputChange(e, setEndTime, "minutes")} 
                        onBlur={() => handleInputBlur(setEndTime, "minutes", startTime)}
                        placeholder="Min" 
                        className="text-black w-16 h-8 font-nunito text-md font-bold bg-transparent border text-center flex items-center justify-center"
                    />
                    <div className="text-black text-xl font-bold font-nunito">:</div>
                    <input 
                        type="number" 
                        value={endTime.seconds} 
                        onChange={(e) => handleInputChange(e, setEndTime, "seconds")} 
                        onBlur={() => handleInputBlur(setEndTime, "seconds", startTime)}
                        placeholder="Sec" 
                        className="text-black w-16 h-8 font-nunito text-md font-bold bg-transparent border text-center flex items-center justify-center"
                    />
                </div>

                <div className="text-black text-xl font-bold font-nunito">Then</div>
                <IFTTTdropdown value={dropdownThenValue} onChange={setDropdownThenValue} dropDownVals={dropDownThen} />
            </div>
        </div>
        
    );
}

export default IFTTTrule;