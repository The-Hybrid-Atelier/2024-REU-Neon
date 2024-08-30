import React, { useEffect, useState } from 'react';
import { Dropdown, Form, Segment } from 'semantic-ui-react';

const FolderStructureDropdowns = ({ defaultVideo, onSelect }) => {
    const [folderStructure, setFolderStructure] = useState([]);
    const [selectedUser, setSelectedUser] = useState(defaultVideo.userId);
    const [selectedBend, setSelectedBend] = useState(defaultVideo.bendType);
    const [selectedTrial, setSelectedTrial] = useState(defaultVideo.trial);
    
    useEffect(() => {
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

        fetchFolderStructure();
    }, []);

    const handleUserChange = (e, { value }) => {
        setSelectedUser(value);
        setSelectedBend(null); // Reset bend and trial
        setSelectedTrial(null);
        onSelect({ user: value, bend: null, trial: null });
    };

    const handleBendChange = (e, { value }) => {
        setSelectedBend(value);
        setSelectedTrial(null); // Reset trial
        onSelect({ user: selectedUser, bend: value, trial: null });
    };

    const handleTrialChange = (e, { value }) => {
        setSelectedTrial(value);
        onSelect({ user: selectedUser, bend: selectedBend, trial: value });
    };

    // Dropdown options for users
    const userOptions = folderStructure.map(user => ({
        key: user.user,
        text: user.user,
        value: user.user,
    }));

    // Dropdown options for bends based on the selected user
    const bendOptions = selectedUser
        ? folderStructure
            .find(user => user.user === selectedUser)
            ?.bends.map(bend => ({
                key: bend.bend,
                text: bend.bend,
                value: bend.bend,
            }))
        : [];

    // Dropdown options for trials based on the selected bend
    const trialOptions = selectedBend
        ? folderStructure
            .find(user => user.user === selectedUser)
            ?.bends.find(bend => bend.bend === selectedBend)
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
                            value={selectedUser}
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
                            value={selectedBend}
                            disabled={!selectedUser}
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
                            value={selectedTrial}
                            disabled={!selectedBend}
                        />
                    </Form.Field>
                </Form.Group>

            </Form>
        </Segment>
    );
};

export { FolderStructureDropdowns };
