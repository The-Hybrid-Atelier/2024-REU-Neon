// Video.js
"use client"; // This marks the component as client-side in Next.js
import '../globals.css';
import React, { useState, useEffect, useRef } from 'react';

import CollapsibleSegment from '../utils/CollapsibleSegment';
import TacitCaptionOutput from '../components/TacitCaptionOutput';
import TacitCaptionInput from '../components/TacitCaptionInput';



function Input() {
  return (
    <div className={`w-full h-full flex flex-col md:flex-row'}`}>
      <TacitCaptionInput/>      
    </div>
  );
};

export default Input;