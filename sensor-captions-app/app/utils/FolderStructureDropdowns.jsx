import React, { useEffect, useState } from 'react';
import { Dropdown, Form, Segment, Header, List } from 'semantic-ui-react';
import { VTT_TYPES } from '@/AppConfig.jsx'; // Import the VTT_TYPES array
import axios from 'axios';
import CollapsibleSegment from './CollapsibleSegment';
const FolderStructureDropdowns = ({ selectedVideo, setSelectedVideo }) => {
    const [folderStructure, setFolderStructure] = useState([]);

    // Fetch the video source from the API
    const fetchVideoSource = async () => {
        const { userId, bendType, trial } = selectedVideo;
        try {
            const response = await fetch(`/api/video/${userId}/${bendType}/${trial}`);
            if (response.ok) {
                const contentType = response.headers.get('Content-Type');

                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    console.log('Video URL:', data.url);
                    console.log('Video Type:', data.type);
                    setSelectedVideo(prevState => ({ ...prevState, source: { url: data.url, type: data.type } })); // 'youtube', 'video/mp4', or 'video/quicktime'

                } else if (contentType && (contentType.includes('video/mp4') || contentType.includes('video/quicktime'))) {
                    // If a stream was returned, use the request URL as the video source
                    const videoUrl = `/api/video/${userId}/${bendType}/${trial}`;
                    const videoType = contentType;
                    console.log('Video Stream URL:', videoUrl);
                    console.log('Video Stream Type:', videoType);
                    setSelectedVideo(prevState => ({ ...prevState, source: { url: videoUrl, type: videoType } }));
                } else {
                    console.error('Unexpected content type:', contentType);
                    setSelectedVideo(prevState => ({ ...prevState, source: { url: null, type: null } }));
                }
            } else {
                console.error('Error fetching video source:', response.statusText);
                setSelectedVideo(prevState => ({ ...prevState, source: { url: null, type: null } }));
            }
        } catch (error) {
            console.error('Error during fetch:', error);
            setSelectedVideo(prevState => ({ ...prevState, source: { url: null, type: null } }));
        }
    };

    // Dynamically check for each VTT file
    const loadVttFiles = async () => {
        const tracks = [];
        const { userId, bendType, trial } = selectedVideo;
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
        setSelectedVideo(prevState => ({ ...prevState, captions: tracks, activated_captions: [] }));
    };

    const fetchAirData = async () => {
        try {
            const { userId, bendType, trial } = selectedVideo;

            const response = await axios.get(`/api/airdata/${userId}/${bendType}/${trial}`);
            const { t, kPa, videoTime } = response.data;
            // Create the data for the chart
            const labels = videoTime; //t.map(time => new Date(Date.now() + time * 1000).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }));
            const data = kPa;
            setSelectedVideo(prevState => ({ ...prevState, airdata: { labels, data, t } }));
        } catch (error) {
            console.error('Error fetching data:', error);
        }

    };
    // Fetch the folder structure from the API
    const fetchFolderStructure = async () => {
        try {
            const response = await fetch('/api/folder-structure');
            if (response.ok) {
                const data = await response.json();
                setFolderStructure(data);
            } else {
                console.error('Error fetching folder structure:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching folder structure:', error);
        }
    };

    useEffect(() => { fetchFolderStructure(); }, []);
    // For debugging purposes
    // useEffect(() => {
    //     console.log('Selected Video Source Updated:', selectedVideo);
    // }, [selectedVideo]);

    useEffect(() => {
        fetchVideoSource();
        loadVttFiles();
        fetchAirData();
    }, [selectedVideo.userId, selectedVideo.bendType, selectedVideo.trial]);

    const handleUserChange = (e, { value }) => {
        setSelectedVideo(prevState => ({ ...prevState, userId: value, bendType: null, trial: null }));
    };

    const handleBendChange = (e, { value }) => {
        setSelectedVideo(prevState => ({ ...prevState, bendType: value, trial: null }));
    };

    const handleTrialChange = (e, { value }) => {
        setSelectedVideo(prevState => ({ ...prevState, trial: value }));
    };

    // Dropdown options for users
    const userOptions = folderStructure.map(user => ({
        key: user.user,
        text: user.user,
        value: user.user,
    }));

    // Dropdown options for bends based on the selected user
    const bendOptions = selectedVideo.userId
        ? folderStructure
            .find(user => user.user === selectedVideo.userId)
            ?.bends.map(bend => ({
                key: bend.bend,
                text: bend.bend,
                value: bend.bend,
            }))
        : [];

    // Dropdown options for trials based on the selected bend
    const trialOptions = selectedVideo.bendType
        ? folderStructure
            .find(user => user.user === selectedVideo.userId)
            ?.bends.find(bend => bend.bend === selectedVideo.bendType)
            ?.trials.map(trial => ({
                key: trial.trial,
                text: trial.trial,
                value: trial.trial,
            }))
        : [];

    return (
        <Segment>
            <Form>
                <Form.Group widths="equal">
                    <Form.Field>
                        <label>Select User</label>
                        <Dropdown
                            placeholder="Select User"
                            fluid
                            selection
                            options={userOptions}
                            onChange={handleUserChange}
                            value={selectedVideo.userId}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Select Bend</label>
                        <Dropdown
                            placeholder="Select Bend"
                            fluid
                            selection
                            options={bendOptions}
                            onChange={handleBendChange}
                            value={selectedVideo.bendType}
                            disabled={!selectedVideo.userId}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Select Trial</label>
                        <Dropdown
                            placeholder="Select Trial"
                            fluid
                            selection
                            options={trialOptions}
                            onChange={handleTrialChange}
                            value={selectedVideo.trial}
                            disabled={!selectedVideo.bendType}
                        />
                    </Form.Field>
                </Form.Group>

            </Form>
            <CollapsibleSegment title="Video Metadata">
                <Header as="h3">Video Metadata</Header>
                <p><strong>User:</strong> {selectedVideo?.userId}</p>
                <p><strong>Bend Type:</strong> {selectedVideo?.bendType}</p>
                <p><strong>Trial:</strong> {selectedVideo?.trial}</p>
                {selectedVideo?.source?.url && (
                    <p><strong>Video URL:</strong> <a href={selectedVideo?.source?.url} target="_blank" rel="noopener noreferrer">{selectedVideo.source.url}</a> ({selectedVideo.source.type})</p>
                )}
                {!selectedVideo?.source?.url && (
                    <p><strong>Video URL:</strong> Video was not found</p>
                )}
                <Header as="h3">Available Captions</Header>
                {selectedVideo?.captions?.length > 0 ? (
                    <List>
                        {selectedVideo?.captions?.map((track, index) => (
                            <List.Item key={index}>
                                <List.Icon name="file text" />
                                <List.Content>{track.label}</List.Content>
                            </List.Item>
                        ))}
                    </List>
                ) : (
                    <p>No captions found.</p>
                )}
                <Header as="h3">Air Data</Header>
                {selectedVideo?.airdata ? (
                    <List>
                        <List.Item>
                            <List.Icon name="chart line" />
                            <List.Content>
                                <List.Header>Pressure (kPa)</List.Header>
                                <List.Description>Available {selectedVideo?.airdata?.data?.length} datapoints</List.Description>
                            </List.Content>
                        </List.Item>
                    </List>
                ) : (
                    <p>No air data found.</p>
                )}
            </CollapsibleSegment>
        </Segment>
    );
};

export { FolderStructureDropdowns };
