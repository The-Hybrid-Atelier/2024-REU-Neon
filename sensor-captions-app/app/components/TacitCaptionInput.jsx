import React, { useState, useRef } from 'react';
import { Container, Segment, Icon, Button, Divider } from 'semantic-ui-react';
import CaptionController from '../player/CaptionController';
import TimeSeriesViewer from '../timeseries/TimeSeriesViewer';
import { INPUT_MODES, VIDEO_DEFAULT } from '@/AppConfig.jsx'; // Import the VIDEO_DEFAULT
import { FolderStructureDropdowns } from '../utils/FolderStructureDropdowns'; // Adjust path as necessary
import SimpleVideoPlayer from '../player/SimpleVideoPlayer';
import { Remote } from '../websocket/Remote';
import CollapsibleSegment from '../utils/CollapsibleSegment';
import Ribbon from '../dev/Ribbon';
import { start } from 'tone';

const TacitCaptionInput = () => {
  const [inputMode, setInputMode] = useState([INPUT_MODES[0]]); // Single-select, default to second mode

  const [selectedVideo, setSelectedVideo] = useState(VIDEO_DEFAULT);
  const videoPlayerRef = useRef(null);
  const remoteRef = useRef(null);
  const [activeCue, setActiveCue] = useState(null);

  const handleSeek = (toTime) => {
    const player = videoPlayerRef.current.getPlayer();
    const currentT = player.currentTime;
    player.currentTime = toTime;
    console.log("Seeking to:", toTime, "from:", currentT);
  };

  const handleCueChange = (cue) => {
    setActiveCue(cue);
    if (remoteRef.current) {
      const { startTime, endTime, text } = cue;
      const serializedCue = { startTime, endTime, text };

      selectedVideo?.activated_captions.forEach(caption => {
        const serializedCue = { startTime, endTime, text };
        remoteRef.current.jsend({ event: `${caption.value}-cue`, data: serializedCue });
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

    <Remote name="input-controller" ref={remoteRef} settings={[inputModeSetting, videoSetting]} collapsible={true}>

      {inputMode[0]?.value === "video" && (
        <>
          {captionSetting.view}
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
          <h1> LIVE </h1>
          {/* Optional sensor-related components */}
        </div>
      )}
    </Remote>



  );
};

export default TacitCaptionInput;
