## /DataProcessing Guide by Roy

## /DataCollection060524 
 contains the raw data collected on June 5th 2024. 

## /DataProcessing
  All of the code and pretty much entire directory is made and used by Rohita K. This is my best attempt at explaining and re-organizing it. - Roy

  contains the code to generate VTT files from .csv data files. **Data has been moved to DataProcessing/Data directory** so paths in the python scripts **need to be updated**. 

  ### vtt_file_filter1filemerge.py
  I think this code was a (successful?) attempt at merging the metadata and display captions into one .vtt file. 

  ### vtt_file_filter_2files.py
  Filters a raw(?) .csv file into blow events and converts the pressure value into a 1-12 intensity value. Outputs two files:
  *MadL_bendCap.vtt* -- Pressure and Boxes displayed in the video caption. e.g. ■□□□□□□□□□□□□□□  98.66 kPa 
  *MadL_bendMeta.vtt* -- Metadata values used to cue the feedback mechanisms. 

  ### vtt_file_filter_sound.py
  I think this is the same as vtt_file_filter_1filemerge.py *except* it adds cues to start and stop kitchen audio. e.g. Sound: stoveOn"

  Note: The actual "stoveOn" cue is not used in the WebApp. Instead, the WebApp looks for a "-1" intensity value. 
  
  ## /Data
  All data files used by the python scripts in this directory are here. I believe these are raw data but not 100% sure. 

## /Visualization
All code written by Roy
  
  ### PressureLiveViz.ipynb
  Big Jupyter notebook that can 
  1. Collect Data over *Serial* connection when ESP32 is flashed with Sensors4Python.ino. Code is also used by Anas for his project. 
  2. Filter data from original (raw) to 3 different levels of filtering.
    a. **preprocess** -- removes all columns except time and pressure, cleans up any data collection outliers from errors (e.g. a negative or 0 pressure reading), converts ms --> sec, Pa --> kPa. 
    b. **filtered** -- From preprocessed data, removes start spike indicator and end spike indicator if present. 
    c. **blowOnly** -- Cuts data to only preserve data during the blowing and bending. 
  3. Visualize and export graphs using Matplotlib and Seaborn. 
  4. Run Dynamic Time Warping analysis -- not used 
  5. Mark peaks, derivative segmenting etc. (buggy and deprecated)
  
  ## /AnasData 
  Holds data and graphs used by Anas for his Air Resistor project

  ## /julyData
  Holds raw and filtered data from july 3rd(?) data collection. 

  ## /Phase1Data
  Holds data from the June data collection, old filterings of it, dtw, graphs etc. Not really used. 