"""
vtt_file_filter_2files.py

This script processes a CSV file to detect events based on the values in a specific column ('Pa'). It generates two separate WebVTT files: one for captions and one for metadata. 
These VTT files are then used in the Node.js application to display captions and metadata during video playback.

Functions:
-----------
1. detect_events_with_meter(csv_file_path, capVtt_file_path, metaVtt_file_path, threshold=99000, numBoxes=12, offset=2000):
    - Detects events based on the values in a 'Pa' column of the CSV file and writes separate caption and metadata WebVTT files.
    Parameters:
    -----------
    - csv_file_path: str
        The path to the CSV file containing event data. The CSV should contain at least two columns: 'Pa' and 'Time'.
        
    - capVtt_file_path: str
        The path to the output caption WebVTT file that will be generated.
        
    - metaVtt_file_path: str
        The path to the output metadata WebVTT file that will be generated.
        
    - threshold: int, optional
        The threshold value used to detect events based on the 'Pa' column in the CSV.
        
    - numBoxes: int, optional
        The number of events to detect. Default is 12.
        
    - offset: int, optional
        The time offset in milliseconds to adjust the start and end times of detected events. Default is 2000 (2 seconds).

2. formatTime(mseconds)
    - Formats the time in milliseconds to the WebVTT time format (HH:MM:SS.mmm).
    Parameters:
    -----------
    - mseconds: int
        The time in milliseconds to be formatted.

Function Workflow:
------------------
1. The script reads the CSV file and detects the maximum value in the 'Pa' column.
2. It processes the rows in the CSV file to find event occurrences based on the threshold and other parameters.
3. The script writes two separate WebVTT files: one for captions and one for metadata.

Notes:
------
- The VTT files created by this script follow the WebVTT standard format, used for our Node.js application to display captions and metadata during video playback.
- The only difference between this file and the filemerge script is that this script generates two separate VTT files: one for captions and one for metadata.
"""

import csv

def detect_events_with_meter(csv_file_path, capVtt_file_path, metaVtt_file_path, threshold=99000, numBoxes=12, offset=2000):

    # Find the maximum 'Pa' value in the CSV file
    maxPa = float('-inf')
    with open(csv_file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            pa = float(row['Pa'])
            if pa > maxPa:
                maxPa = pa
    # Open the CSV file and read the rows
    with open(csv_file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    # Write the captions and metadata to separate WebVTT files
    with open(capVtt_file_path, 'w') as capVttfile, open(metaVtt_file_path, 'w') as metaVttfile:
        # Write the WebVTT headers for captions and metadata files, respectively
        capVttfile.write("WEBVTT\n")
        capVttfile.write("Kind: captions\n")
        capVttfile.write("Language: en\n\n")

        metaVttfile.write("WEBVTT\n")
        metaVttfile.write("Kind: metadata\n")
        metaVttfile.write("Language: en\n\n")

        # Write the initial sound event for the first row
        if rows:
            first_time = float(rows[0]['Time'])
            start_time_str = formatTime(first_time - 1000)
            end_time_str = formatTime(first_time)
            capVttfile.write(f"{start_time_str} --> {end_time_str} align:start position:0%\n")
            capVttfile.write("Sound: stoveOn\n")
        
        # Initialize variables for tracking event changes
        previous_val = None
        previous_start_time = None
        previous_end_time = None
        
        # Iterate through the rows and process the events
        for row in rows:
            time = float(row['Time'])
            pa = float(row['Pa'])
            kpa = pa / 1000
            # time = time*1000 #comment this line out depending of the format of time, in if the time is in seconds

            # Calculate the scale range for the pressure values
            scaleMin = threshold - offset
            scaleMax = maxPa
            scaleRange = scaleMax - scaleMin

            # Scale the pressure value to the range of the meter
            pa = max(scaleMin, min(pa, scaleMax))

            # Calculate the number of filled boxes based on the scaled pressure value
            filledBoxes = int((pa - scaleMin) / scaleRange * numBoxes)
            val = filledBoxes

            # Create the meter with filled and empty boxes based on the pressure value
            meter = "■" * filledBoxes + "□" * (numBoxes - filledBoxes)

            # Check if the current event is the same as the previous event, and adjust the end time, else write the previous event
            if previous_val is not None and val == previous_val:
                previous_end_time = time + 310
            else:
                if previous_val is not None:
                    startTime = formatTime(previous_start_time)
                    endTime = formatTime(previous_end_time)
                    # vttfile.write(f"NextSound : {previous_val}\n")
                    # vttfile.write(f"NextVibrationSpeed : {previous_val}\n")
                    # vttfile.write(f"NextLightInten : {previous_val}\n\n")
                    # vttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
                    # vttfile.write(f"Sound : {previous_val}\n")
                    # vttfile.write(f"LightInten : {previous_val}\n")
                    # vttfile.write(f"VibrationSpeed : {previous_val}\n")
                    # vttfile.write(f"Duration : {previous_end_time - previous_start_time}\n")

                    capVttfile.write(f"NextSound : {previous_val}\n")
                    capVttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
                    capVttfile.write(f"Sound : {previous_val}\n")
                    capVttfile.write(f"Duration : {previous_end_time - previous_start_time}\n")

                    metaVttfile.write(f"{startTime} --> {endTime}\n")
                    metaVttfile.write(f"{meter}  {kpa:.2f} kPa\n\n")
                
                # Update the previous values for the next event
                previous_val = val
                previous_start_time = time
                previous_end_time = time + 310

        # Write the last event to the VTT files
        if previous_val is not None:
            startTime = formatTime(previous_start_time)
            endTime = formatTime(previous_end_time)
            # vttfile.write(f"NextSound : {previous_val}\n")
            # vttfile.write(f"NextVibrationSpeed : {previous_val}\n")
            # vttfile.write(f"NextLightInten : {previous_val}\n\n")
            # vttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
            # vttfile.write(f"Sound : {previous_val}\n")
            # vttfile.write(f"LightInten : {previous_val}\n")
            # vttfile.write(f"VibrationSpeed : {previous_val}")
            # vttfile.write(f"Duration : {previous_end_time - previous_start_time}\n")

            capVttfile.write(f"NextSound : {previous_val}\n")
            capVttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
            capVttfile.write(f"Sound : {previous_val}\n")
            capVttfile.write(f"Duration : {previous_end_time - previous_start_time}\n")
            
            metaVttfile.write(f"{startTime} --> {endTime}\n")
            metaVttfile.write(f"{meter}  {kpa:.2f} kPa\n\n")

        # Obtain the end time of the last event and write the event to the VTT files
        end_time = float(rows[-1]['Time']) + 1000
        end_time_str = formatTime(end_time)
        end_time_plus_1_str = formatTime(end_time + 1000)

        capVttfile.write(f"{end_time_str} --> {end_time_plus_1_str} align:start position:0%\n")
        capVttfile.write("Sound: bell\n\n")
        
#Helper function to format time in milliseconds to HH:MM:SS.mmm format
def formatTime(mseconds):
    seconds = mseconds / 1000
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    mseconds = int(mseconds % 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}.{mseconds:03}"

# Ex
csv_file_path = 'MadL_bend2.csv'

# Output files
# Caption VTT file
capVtt_file_path = 'MadL_bendCap.vtt'

# Metadata VTT file
metaVtt_file_path = 'MadL_bendMeta.vtt'
detect_events_with_meter(csv_file_path, capVtt_file_path, metaVtt_file_path)
