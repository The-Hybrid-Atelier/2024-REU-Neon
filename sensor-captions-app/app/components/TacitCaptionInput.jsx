import React, { useState, useRef, useEffect} from 'react';
import { Container, Segment, Icon, Button, Divider, ButtonGroup} from 'semantic-ui-react';
import CaptionController from '../player/CaptionController';
import TimeSeriesViewer from '../timeseries/TimeSeriesViewer';
import { INPUT_MODES, VIDEO_DEFAULT, WINDOWSIZE, AIR_RANGE} from '@/AppConfig.jsx'; // Import the VIDEO_DEFAULT
import { FolderStructureDropdowns } from '../utils/FolderStructureDropdowns'; // Adjust path as necessary
import SimpleVideoPlayer from '../player/SimpleVideoPlayer';
import { Remote } from '../websocket/Remote';
import CollapsibleSegment from '../utils/CollapsibleSegment';
import Ribbon from '../dev/Ribbon';
import { start } from 'tone';
import SensorViewer from '../timeseries/SensorViewer';

function minMaxScalar(value, min, max) {
  // Ensure the value is capped between the min and max range
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}


const TacitCaptionInput = () => {
  const [rate, setRate] = useState(50); // State for the slider value
  const [bleConnected, setBLEConnected] = useState(false);
  const [inputMode, setInputMode] = useState([INPUT_MODES[0]]); // Single-select, default to second mode
  const [sensorData, setSensorData] = useState([0, 0, 1, 1, 0, 0]);
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_DEFAULT);
  const videoPlayerRef = useRef(null);
  const remoteRef = useRef(null);
  const [activeCue, setActiveCue] = useState(null);
  const [lastLiveCue, setLastLiveCue] = useState(0);
  const inputModeRef = useRef(inputMode); // To store the latest activated_captions

  const handleChangeRate = () => {
    // Send the rate message when the button is clicked
    remoteRef.current.jsend({
      api: "change_rate",
      params: { rate }
    });
  };

  useEffect(() => {
    // Sync the latest state of activated_captions to the ref
    inputModeRef.current = inputMode;
  }, [inputMode]);

  const handleSeek = (toTime) => {
    const player = videoPlayerRef.current.getPlayer();
    const currentT = player.currentTime;
    player.currentTime = toTime;
    console.log("Seeking to:", toTime, "from:", currentT);
  };
  const websocketEventHandler = (data) => {
      if(data?.event === "ble-connected") {
        setBLEConnected(true);
      }
      if(data?.event === "read-pressure") {
        if(inputModeRef.current[0]?.value === "sensor" ){
            setSensorData(prevData => {
              
              const scaledData = data?.data.map(value => minMaxScalar(value, AIR_RANGE.min, AIR_RANGE.max));
              let updatedData = [...prevData, ...scaledData];
              if (updatedData.length > WINDOWSIZE) {
                updatedData = updatedData.splice(updatedData.length - WINDOWSIZE);
              }
              return updatedData;
            });
            
          
            const value = data?.data[0];
            const p = minMaxScalar(value, AIR_RANGE.min, AIR_RANGE.max);
            console.log(data?.data, value, p);


            const p10 = Math.ceil(p * 10);
            const p100 = Math.ceil(p * 100);

            if(lastLiveCue !== p10) {
              setLastLiveCue(p10);
              console.log("Sending live cue:", p100);
              // Forwarding data to the captions
              remoteRef.current.jsend({ event: `live-cue`, data: {text: p100} });
            }
          }
      }
  }

  const handleCueChange = (cue) => {
    setActiveCue(cue);
    if (remoteRef.current) {
      const { startTime, endTime, text } = cue;
      const serializedCue = { startTime, endTime, text };

      selectedVideo?.activated_captions.forEach(caption => {
        const serializedCue = { startTime, endTime, text };
        remoteRef.current.jsend({ event: `vtt-cue`, data: serializedCue });
      });
    }
  }


  const inputModeSetting = {
    name: "Input Mode",
    viewable: true,
    startSettingCollapsed: true,
    view: (
      <>
        <Ribbon
          modes={INPUT_MODES}
          isActive={inputMode}
          setIsActive={setInputMode}
          typeSelect="single"
        />
      </>
    )
  };

  const videoSetting = {
    name: "Video Source",
    viewable: inputMode[0]?.value === "video",
    startSettingCollapsed: false,
    view: (    
      <>
        <FolderStructureDropdowns selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo} />
      </>
    
    )
  };

  const captionSetting = {
    name: "Captions",
    startSettingCollapsed: false,
    viewable: inputMode[0]?.value === "video",
    view: (
      <>
        <CaptionController selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo} /> 
      </>
    )
  };


  return (

    <Remote name="input-controller" ref={remoteRef} settings={[]} websocketEventHandler={websocketEventHandler} collapsible={false}>
      {inputModeSetting.view}
      {inputMode[0]?.value === "video" && (
        <>
          {captionSetting.view}
          {videoSetting.view}
          <SimpleVideoPlayer
            ref={videoPlayerRef}
            selectedVideo={selectedVideo}
            onCueChange={handleCueChange}
          />
          <TimeSeriesViewer
            selectedVideo={selectedVideo}
            timePosition={100}
            onGraphClick={handleSeek}
            width="100%"  // Adjust width as needed
            height="100%"
            />
          </>
          )}


          {inputMode[0]?.value === "sensor" && (
          <div className="p-5">
            <h1>{bleConnected ? `LIVE (${sensorData.length})` : "CONNECTING..."}</h1>
            
             <SensorViewer
            sensorData={sensorData}
            />
            <div className="w-full flex flex-row items-center justify-center">
            <div className="p-4">
            {/* Button group */}
            <ButtonGroup>
              <Button color="green" onClick={() => remoteRef.current.jsend({ api: "start" })}>ON</Button>
              <Button color="red" onClick={() => remoteRef.current.jsend({ api: "stop" })}>OFF</Button>
              <Button color="yellow" onClick={handleChangeRate}>Change Rate</Button>
            </ButtonGroup>
            
            {/* Slider */}
            <div className="mt-4">
              <label className="block text-gray-700 mb-2">Rate: {rate} ms</label>
              <input
                type="range"
                min="50"
                max="1000"
                step="1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
            
          </div>
        </div>
      )}
      
    </Remote>



  );
};

export default TacitCaptionInput;
