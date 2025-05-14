import React from 'react';
import IconButton from '../Button';

const VideoController = () => {
    return (
        <div>
            {/* Your VideoController content here */}
            <h2>Video Controller</h2>
            {buttonLabelsLeft.map((label, index) => (
                <IconButton
                    key={index}
                    icon={svgIconsLeft[index]}
                    isActive={buttonsLeft[index]}
                    onClick={handleButtonClickLeft(index)} // Pass the click handler
                />
            ))}
        </div>
    );
};

export default VideoController;
