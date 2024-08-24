"""
vtt_file_filter_1filemerge.py

This script processes a CSV file to detect events based on the values in a specific column ('Pa'). It then generates a single merged WebVTT file containing both captions and metadata.
These VTT files can be used in video players to display captions and associated metadata during playback.

Functions:
-----------
1. detect_events_with_meter(csv_file_path, capVtt_file_path, metaVtt_file_path, threshold=99000, numBoxes=12, offset=2000):
    - Detects events based on the values in a 'Pa' column of the CSV file and writes the combined captions and metadata to a single WebVTT file.
    Parameters:
    -----------
    - csv_file_path: str
        The path to the CSV file containing event data. The CSV should contain at least two columns: 'Pa' and 'Time'.
    
    - capVtt_file_path: str
        The path to the output WebVTT file that will be generated. This file will contain both captions and metadata.
    
    - metaVtt_file_path: str
        (Redundant) This parameter is not used separately but points to the same file as capVtt_file_path, reflecting the merged nature of the output.
    
    - threshold: int, optional
        The threshold value used to detect events based on the 'Pa' column in the CSV. Default is 99,000.
    
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
3. The script writes a WebVTT file, including both captions and metadata. The file begins with WebVTT headers and then includes formatted event timings for captions and metadata.

Notes:
------
- This script writes a single merged VTT file that combines both captions and metadata.
- The generated WebVTT file follows the WebVTT standard format, which can be displayed by modern web-based video players.
"""

import csv

def detect_events_with_meter(csv_file_path, capVtt_file_path, metaVtt_file_path, threshold=99000, numBoxes=12, offset=2000):
    maxPa = float('-inf')
    with open(csv_file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            pa = float(row['Pa'])
            #Gets the maximum value of the pressure
            if pa > maxPa:
                maxPa = pa
    #Opens the csv file and reads the rows
    with open(csv_file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    #Opens the vtt file and writes the header, i.e. WEBVTT, Kind, Language
    with open(capVtt_file_path, 'w') as capVttfile, open(metaVtt_file_path, 'w') as capVttfile:
        capVttfile.write("WEBVTT\n")
        capVttfile.write("Kind: captions\n")
        capVttfile.write("Language: en\n\n")

        #If the rows are not empty, it writes the first event
        if rows:
            first_time = float(rows[0]['Time'])
            start_time_str = formatTime(first_time - 1000)
            end_time_str = formatTime(first_time)
            capVttfile.write(f"{start_time_str} --> {end_time_str} align:start position:0%\n")
            capVttfile.write("Sound: stoveOn\n")

        #Initializes the previous values to None
        previous_val = None
        previous_start_time = None
        previous_end_time = None
        
        #Iterates through the rows and processes the events
        for row in rows:
            time = float(row['Time'])
            pa = float(row['Pa'])
            kpa = pa / 1000
            # time = time*1000 #comment this line out depending of the format of time, in if the time is in seconds

            # Scale the pressure value to the range of the meter
            scaleMin = threshold - offset
            scaleMax = maxPa
            scaleRange = scaleMax - scaleMin

            #Takes the maximum of the scaleMin and the minimum of the scaleMax and the pressure value, then scales it to the number of boxes
            pa = max(scaleMin, min(pa, scaleMax))

            filledBoxes = int((pa - scaleMin) / scaleRange * numBoxes)
            val = filledBoxes

            #Creates the meter with the filled boxes and the empty boxes, depending on the value of the pressure
            meter = "■" * filledBoxes + "□" * (numBoxes - filledBoxes)

            #If the previous value is not None and the value is the same as the previous value, the end time is increased by 310, else the previous value is written to the vtt file
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

                    capVttfile.write(f"{startTime} --> {endTime}\n")
                    capVttfile.write(f"{meter}  {kpa:.2f} kPa\n\n")

                previous_val = val
                previous_start_time = time
                previous_end_time = time + 310

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
            
            capVttfile.write(f"{startTime} --> {endTime}\n")
            capVttfile.write(f"{meter}  {kpa:.2f} kPa\n\n")

        #Obtains the end time of the last event and writes the event to the vtt file
        end_time = float(rows[-1]['Time']) + 1000
        end_time_str = formatTime(end_time)
        end_time_plus_1_str = formatTime(end_time + 1000)

        capVttfile.write(f"{end_time_str} --> {end_time_plus_1_str} align:start position:0%\n")
        capVttfile.write("Sound: bell\n\n")

#Helper function to format the time in milliseconds to the WebVTT time format (HH:MM:SS.mmm)
def formatTime(mseconds):
    seconds = mseconds / 1000
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    mseconds = int(mseconds % 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}.{mseconds:03}"

# Ex
#CSV input file path
csv_file_path = 'Data/MadL_bend2.csv'

#Output merged file path
capVtt_file_path = 'MadL_bendMerge.vtt'

# metaVtt_file_path = 'MadL_bendMeta.vtt'
detect_events_with_meter(csv_file_path, capVtt_file_path)
