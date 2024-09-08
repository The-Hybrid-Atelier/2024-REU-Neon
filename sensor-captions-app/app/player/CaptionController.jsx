import React from 'react';
import CollapsibleSegment from '../utils/CollapsibleSegment';
import Ribbon from '../dev/Ribbon';
import { CAPTION_ICON_MAPPING } from '@/AppConfig';
const CaptionController = ({ selectedVideo, setSelectedVideo, multipleSelection=false }) => {
  const captions = selectedVideo?.captions || [];
  const activated_captions = selectedVideo?.activated_captions || [];
  const modes = captions.map(caption => {
    return{
      label: caption.label,
      icon: CAPTION_ICON_MAPPING[caption.value],
      value: caption.value
    }
  });
  const setActivatedCaptions = (updatedCaptions) => {
    setSelectedVideo(prevState => ({
      ...prevState,
      activated_captions: updatedCaptions
    }));
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <Ribbon
        modes={modes}
        isActive={activated_captions}
        setIsActive={setActivatedCaptions}
        typeSelect={multipleSelection ? 'multi' : 'single'}
      />
      {/* <p>({activated_captions.length} / {captions.length} available)</p>
      <p>{JSON.stringify(activated_captions)}</p>
      <p>{JSON.stringify(captions)}</p> */}
    </div>
  );
};

export default CaptionController;