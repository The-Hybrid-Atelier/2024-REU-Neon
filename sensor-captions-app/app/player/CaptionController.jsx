import React from 'react';
import { Button } from 'semantic-ui-react';

const CaptionController = ({ selectedVideo, setSelectedVideo, multipleSelection }) => {

  const handleClick = (captionLabel) => {
    const { activated_captions } = selectedVideo;
    let updatedCaptions;

    if (multipleSelection) {
      if (activated_captions.includes(captionLabel)) {
        updatedCaptions = activated_captions.filter(item => item !== captionLabel);
      } else {
        updatedCaptions = [...activated_captions, captionLabel];
      }
    } else {
      updatedCaptions = activated_captions.includes(captionLabel) ? [] : [captionLabel];
    }

    setSelectedVideo(prevState => ({
      ...prevState,
      activated_captions: updatedCaptions
    }));
  };

  return (
    <div>
      <h3>Captions </h3>
      <p>({selectedVideo?.captions?.length} available)</p>
      {selectedVideo.captions && selectedVideo.captions.map(caption => {
        const isActive = selectedVideo.activated_captions.includes(caption.label);
        const icon = (
            <img
                src={`/icons/${caption.label.toLowerCase()}.svg`}
                alt={`${caption.label} icon`}
                style={{ width: '2em', height: '2em', fill: 'white' }}
            />
        );
        return (
            <button
            key={caption.label}
            color="gray"
            onClick={() => handleClick(caption.label)}
            className={`!flex flex-col justify-center items-center text-white rounded p-2 w-full ${isActive ? 'bg-[#0f68a9]' : 'bg-gray-400'} hover:bg-[#0276ab]`}
            circular
            >
            {icon}
            <span>{caption.label}</span>
            </button>
        );
      })}
    </div>
  );
};

export default CaptionController;
