import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Message } from 'semantic-ui-react';

const SimpleVideoPlayer = forwardRef(({ selectedVideo, onCueChange }, ref) => {
  const { source, captions } = selectedVideo;

  const videoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getPlayer: () => videoRef.current,
  }));

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    const handleCueChange = (event) => {
      const track = event.target;
      if (track.activeCues.length > 0) {
        onCueChange(track.activeCues[0]);
      }
    };

    const trackElements = videoElement.textTracks;
    if (trackElements.length > 0) {
      const track = trackElements[0];
      track.mode = 'showing';
      track.addEventListener('cuechange', handleCueChange);
    }

    return () => {
      if (trackElements.length > 0) {
        const track = trackElements[0];
        if (track) {
          track.removeEventListener('cuechange', handleCueChange);
        }
      }
    };
  }, [onCueChange]);

  return (
    <>
      {selectedVideo?.source?.url ? (
        <video
          ref={videoRef}
          controls
          preload="auto"
          style={{ width: '100%', height: 'auto' }}
        >
          <source src={source.url} type={source.type} />
          {captions.map((caption, index) => (
            <track
              key={index}
              kind={caption.kind}
              src={caption.src}
              srcLang={caption.srclang}
              label={caption.label}
              default={caption.default}
            />
          ))}
          Your browser does not support the video tag.
        </video>
      ) : (
        <Message>No video source provided.</Message>
      )}
    </>
  );
});

export default SimpleVideoPlayer;
