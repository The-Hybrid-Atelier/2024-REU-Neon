"""
vtt_file_filter_sound.py

Function Workflow:
------------------
1. The script reads the CSV file and detects the maximum value in the 'Pa' column.
2. It processes the rows in the CSV file to find event occurrences based on the threshold and other parameters.
3. The script writes two separate WebVTT files: one for captions and one for metadata.

Notes:
------
- The VTT files created by this script follow the WebVTT standard format, used for our Node.js application to display captions and metadata during video playback.
- The only difference between this file and the 2files script is that this script it adds cues to start and stop kitchen audio. e.g. Sound: stoveOn
- Might be moved to archvied folder, as the Node.js application does not use this script's sound cues, and instead uses a different method to detect audio events.
"""

import csv

def detect_events_with_meter(csv_file_path, vtt_file_path, threshold=99000, numBoxes=12, offset=2000):

    #Obtains the maximum value of the pressure
    maxPa = float('-inf')
    with open(csv_file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            pa = float(row['Pa'])
            if pa > maxPa:
                maxPa = pa

    #Opens the csv file and reads the rows
    with open(csv_file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    #Opens the vtt file and writes the header, i.e. WEBVTT, Kind, Language
    with open(vtt_file_path, 'w') as vttfile:
        vttfile.write("WEBVTT\n")
        vttfile.write("Kind: captions\n")
        vttfile.write("Language: en\n\n")

        vttfile.write("00:00:00.000 --> 00:00:01.000 align:start position:0%\n")
        vttfile.write("Sound: stoveOn\n\n")

        #Initializes the previous values to None
        previous_val = None
        previous_start_time = None
        previous_end_time = None

        #Iterates through the rows and processes the events
        for row in rows:
            time = float(row['Time'])
            pa = float(row['Pa'])
            kpa = pa / 1000

            #Calculates the scale values
            scaleMin = threshold - offset
            scaleMax = maxPa
            scaleRange = scaleMax - scaleMin

            # Scale the pressure value to the range of the meter
            pa = max(scaleMin, min(pa, scaleMax))
            
            #Calculates the number of filled boxes
            filledBoxes = int((pa - scaleMin) / scaleRange * numBoxes) if pa >= threshold else 0
            val = filledBoxes

            #If the value is the same as the previous value, it extends the end time, if not, it writes the previous event
            if previous_val is not None and val == previous_val:
                previous_end_time = time + 310
            else:
                if previous_val is not None:
                    startTime = formatTime(previous_start_time)
                    endTime = formatTime(previous_end_time)
                    vttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
                    vttfile.write(f"Boxes: {previous_val}\n\n")
                
                #Updates the previous values
                previous_val = val
                previous_start_time = time
                previous_end_time = time + 310

        #Writes the last event
        if previous_val is not None:
            startTime = formatTime(previous_start_time)
            endTime = formatTime(previous_end_time)
            vttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
            vttfile.write(f"Boxes: {previous_val}\n\n")

        #Writes the last sound event
        end_time = float(rows[-1]['Time']) + 1000
        end_time_str = formatTime(end_time)
        end_time_plus_1_str = formatTime(end_time + 1000)
        vttfile.write(f"{end_time_str} --> {end_time_plus_1_str} align:start position:0%\n")
        vttfile.write("Sound: bell\n\n")

#Helper function to format the time in the format HH:MM:SS.mmm
def formatTime(mseconds):
    seconds = mseconds / 1000
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    mseconds = int(mseconds % 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}.{mseconds:03}"

#CSV file to be processed
csv_file_path = 'Data/MadL_bend2.csv'

#Output file
vtt_file_path = 'MadL_bendCap.vtt'
detect_events_with_meter(csv_file_path, vtt_file_path)
