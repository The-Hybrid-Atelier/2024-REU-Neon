import React from 'react';

const VideoController = () => {
    return (
        <div>
            {/* Your VideoController content here */}
            <h2>Video Controller</h2>
            {buttonLabelsLeft.map((label, index) => (
                <CustomButton
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
