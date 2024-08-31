import React, { useState } from 'react';
import CaptionedVideoPlayer from './CaptionedVideoPlayer';
import TimeSeriesViewer from '../timeseries/TimeSeriesViewer';

const TacitCaptionVideoPlayer = ({ selectedVideo }) => {
  const [timePosition, setTimePosition] = useState(null);

  const handleGraphClick = (time) => {
    setTimePosition(time);
  };

  const handleRewindOrForward = (seconds) => {
    if (player) {
      // Calculate the new time by adding/subtracting seconds
      const newTime = player.getCurrentTime() + seconds;
      // Seek to the new time immediately
      player.seekTo(newTime, true);

      // Update the currentTime state to reflect the new time for the progress bar
      setCurrentTime(currentTime - seconds);
    }
  };

  return (
    <>
      <CaptionedVideoPlayer selectedVideo={selectedVideo} />
      <TimeSeriesViewer
        selectedVideo={selectedVideo}
        timePosition={timePosition}
        onGraphClick={handleGraphClick}
      />

    </>
  );
};

export default TacitCaptionVideoPlayer;
