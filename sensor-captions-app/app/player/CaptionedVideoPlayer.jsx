import React, { useEffect, useState } from 'react';
import { Container, Header, List, Segment, Divider } from 'semantic-ui-react';
import SimpleVideoPlayer from './SimpleVideoPlayer'; // Adjust path as necessary
import { VTT_TYPES, VIDEO_DEFAULT } from '@/AppConfig.jsx'; // Import the VTT_TYPES array

const CaptionedVideoPlayer = ({ videoToPlay = VIDEO_DEFAULT }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoType, setVideoType] = useState(null);
  const [vttTracks, setVttTracks] = useState([]);
  const { userId, bendType, trial } = videoToPlay;

  useEffect(() => {
    // Fetch the video source from the API
    const fetchVideoSource = async () => {
      try {
        const response = await fetch(`/api/video/${userId}/${bendType}/${trial}`);
        if (response.ok) {
          const contentType = response.headers.get('Content-Type');
    
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Video URL:', data.url);
            console.log('Video Type:', data.type);
            setVideoUrl(data.url);
            setVideoType(data.type); // 'youtube', 'video/mp4', or 'video/quicktime'
          } else if (contentType && (contentType.includes('video/mp4') || contentType.includes('video/quicktime'))) {
            // If a stream was returned, use the request URL as the video source
            const videoUrl = `/api/video/${userId}/${bendType}/${trial}`;
            const videoType = contentType;
            console.log('Video Stream URL:', videoUrl);
            console.log('Video Stream Type:', videoType);
            setVideoUrl(videoUrl);
            setVideoType(videoType);
          } else {
            console.error('Unexpected content type:', contentType);
            setVideoUrl(null);
            setVideoType(null);
          }
        } else {
          console.error('Error fetching video source:', response.statusText);
          setVideoUrl(null);
          setVideoType(null);
        }
      } catch (error) {
        console.error('Error during fetch:', error);
        setVideoUrl(null);
        setVideoType(null);
      }
    };
    

    // Dynamically check for each VTT file
    const loadVttFiles = async () => {
      const tracks = [];

      for (const type of VTT_TYPES) {
        const response = await fetch(`/api/captions/${userId}/${bendType}/${trial}/${type}.vtt`);
        if (response.ok) {
          tracks.push({
            kind: 'subtitles',
            src: `/api/captions/${userId}/${bendType}/${trial}/${type}.vtt`,
            srclang: 'en', // Customize this based on the type or language
            label: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize the first letter
            default: type === 'light', // Set the default track if applicable
          });
        }
      }

      setVttTracks(tracks);
    };

    fetchVideoSource();
    loadVttFiles();
  }, [userId, bendType, trial]);

  const videoJsOptions = {
    techOrder: videoType === 'video/youtube' ? ['youtube'] : ['html5'],
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    playbackRates: [0.25, 0.5, 1, 1.5, 2],
    sources: videoUrl ? [{ src: videoUrl, type: videoType }] : [],
    tracks: vttTracks,
  };
  console.log('VideoJS Options:', videoJsOptions, JSON.stringify(videoJsOptions, null, 2));

  return (
    <Segment>
      <Segment>
        <Header as="h2">Video Metadata</Header>
        <p><strong>User:</strong> {userId}</p>
        <p><strong>Bend Type:</strong> {bendType}</p>
        <p><strong>Trial:</strong> {trial}</p>
        {videoUrl && (
          <p><strong>Video URL:</strong> <a href={videoUrl} target="_blank" rel="noopener noreferrer">{videoUrl}</a> ({videoType})</p>
        )}
        {!videoUrl && (
          <p><strong>Video URL:</strong> Video was not found</p>
        )}
      </Segment>

      <Segment>
        <Header as="h3">Available Captions</Header>
        {vttTracks.length > 0 ? (
          <List>
            {vttTracks.map((track, index) => (
              <List.Item key={index}>
                <List.Icon name="file text" />
                <List.Content>{track.label}</List.Content>
              </List.Item>
            ))}
          </List>
        ) : (
          <p>No captions found.</p>
        )}
      </Segment>

      <Divider />

      {videoUrl ? (
        <SimpleVideoPlayer
          options={videoJsOptions}
          onCueChange={() => console.log('Cue changed')}
          onPlay={() => console.log('Video is playing')}
          onPause={() => console.log('Video is paused')}
          onStop={() => console.log('Video has stopped')}
        />
      ) : (
        <p>Loading video...</p>
      )}
    </Segment>
  );
};

export default CaptionedVideoPlayer;
