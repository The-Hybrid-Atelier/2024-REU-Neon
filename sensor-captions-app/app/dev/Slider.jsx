import React, { useState } from 'react';

const Slider = ({ title}) => {
  const [percentage, setPercentage] = useState(50);

  const handleSlide = (e) => {
    setPercentage(e.target.value);
  };

  return (
    <div className="w-screen px-4">
      <div className="text-left text-black mb-2" style={{ fontFamily: "Arial", fontSize: "9pt" }}>
        {title}: <span className="font-bold">{percentage}%</span>
      </div>
      <div className="relative w-full flex items-center">
        {/* Slider Background */}
        <div
          className="absolute top-1/2 left-0 right-0 h-2 rounded-full"
          style={{
            backgroundImage: `linear-gradient(to right, #BAC1CB ${percentage}%, #BAC1CB ${percentage}%)`,
            transform: 'translateY(-50%)',
            zIndex: 1, // Ensure the slider background is underneath the thumb
          }}
        />
        {/* Slider Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={handleSlide}
          className="w-full h-5 bg-transparent cursor-pointer appearance-none rounded-full relative z-10" // Adjust z-index and positioning
          style={{
            background: 'transparent',
            backgroundImage: `linear-gradient(to right, #7C8086 ${percentage}%, #d1d5db ${percentage}%)`,
            borderRadius: '9999px', // Tailwind equivalent of rounded-full
          }}
        />
      </div>
      
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 17.5px; /* Width of the thumb */
          height: 17.5px; /* Height of the thumb */
          border-radius: 50%; /* Circle shape */
          border: 2px solid #7C8086; /* Black border with 2px width */
          background: #ffffff; /* Color of the thumb */
          cursor: pointer;
          z-index: 2; /* Ensure thumb is above the track */
        }

        input[type="range"]::-moz-range-thumb {
          width: 17.5px; /* Width of the thumb */
          height: 17.5px; /* Height of the thumb */
          border-radius: 50%; /* Circle shape */
          border: 2px solid #7C8086; /* Black border with 2px width */
          background: #ffffff; /* Color of the thumb */
          cursor: pointer;
        }

        input[type="range"]::-ms-thumb {
          width: 17.5px; /* Width of the thumb */
          height: 17.5px; /* Height of the thumb */
          border: 2px solid #7C8086; /* Black border with 2px width */
          border-radius: 50%; /* Circle shape */
          background: #ffffff; /* Color of the thumb */
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Slider;
