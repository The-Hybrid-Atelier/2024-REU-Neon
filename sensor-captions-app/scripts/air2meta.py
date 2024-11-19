"""

air2meta.py

This script processes the extracted data from raw2air.py (air.csv) and the paramertized column created by air2cap.py 
and creates a WebVTT file for all types of feed back with metadata for the data spikes. The type of feedback type is either sound, light, synth, or vibration.


Function:
---------
1. determine_type():
    - Determines the type of feedback based on the meta_type parameter.
    Returns:
    --------
    - The range of intensity for the feedback type.

2. determine_inten(df, i):
    - Determines the intensity of the feedback type based on the pressure parameterized value.
    Parameters:
    -----------
    - df: pandas.DataFrame
        The dataframe containing the pressure data.
    - i: int
        The current index of where to get there parmeeritized value of the pressure.
    Returns:
    --------
    - The intensity determined by the "P1" value on a scale determined by the feedback type

3. write_to_file(capvtt_file, start_time, end_time, inten):
    - Writes the metadata to the WebVTT file.
    Parameters:
    -----------
    - capvtt_file: file
        The file object to write the start time, end time, and feedback type intenisty.
    - start_time: str
        The start time of the event.
    - end_time: str
        The end time of the event.
    - inten: int
        The intensity of the feedback type.
    Returns:
    --------
    - None

4. detect_events_with_inten(df, meta_out_file):
    - Detects the events in the pressure data and writes the metadata to the WebVTT file.
    Parameters:
    -----------
    - df: pandas.DataFrame
        The dataframe containing the pressure, time, and parameterized pressure data.
    - meta_out_file: str
        The file path to write the metadata to.
    Returns:
    --------
    - None

5. formatTime(mseconds):
    - Helper function to format time in milliseconds to HH:MM:SS.mmm format.
    Parameters:
    -----------
    - mseconds: int
        The time in milliseconds.
    Returns:
    --------
    - The formatted time in HH:MM:SS.mmm format.


Command Line Arguments:
-----------
- air_file: str
    The file path to the air.csv file.
- meta_type: str
    The type of feedback to create metadata for. The options are "sound", "light", "synth", or "vibration".

Output:
-------
- A WebVTT file with the metadata for the feedback type.

Function Workflow:
------------------
1. Read the air.csv file.
2. Determine the type of feedback based on the meta_type parameter.
3. Create the metadata file path.
4. Detect the events in the pressure data 
5. Determine the intensity of the feedback type based on the pressure parameterized value.
6. Write the metadata to the WebVTT file.

    
"""

import pandas as pd
import sys
import os


# Determine the range of feedback inten based on the meta_type parameter
def determine_type():
    meta_dict = {"sound": 4, "light": 6, "synth": 6, "vibration": 4}
    return meta_dict.get(meta_type)


# Determine the itenisty of the feedback type based on the pressure parameterized value
def determine_inten(df, i):
    p1_value = df.iloc[i][parameterized_pressure_column]
    inten = int(p1_value * inten_range)

    if meta_type == "sound":
        sound_dict = {
            0: "noSound",
            1: "lightBoiling",
            2: "bubbling",
            3: "bubblingIntense",
            4: "deepFry",
        }
        inten = sound_dict.get(inten)
    elif meta_type == "vibration":
        vibration_dict = {
            0: "stop",
            1: "shortPulse",
            2: "longPulse",
            3: "longDuration",
            4: "rapidPulse",
        }
        inten = vibration_dict.get(inten)
    # If the meta_type is light, convert the intensity to a hex color value with corresponding emoji
    elif meta_type == "light":

        light_dict = {
            0: (0xFF0000, "🟥"),
            1: (0xFF7F00, "🟧"),
            2: (0xFFFF00, "🟨"),
            3: (0x00FF00, "🟩"),
            4: (0x0000FF, "🟦"),
            5: (0x4B0082, "🟪"),
            6: (0x8B00FF, "🟫"),
        }

        inten = light_dict.get(inten)
    elif meta_type == "synth":

        synth_dict = {
            0: "",
            1: "♪",
            2: "♪♪",
            3: "♪♪♪",
            4: "♪♪♪♪",
            5: "♪♪♪♪♪",
            6: "♪♪♪♪♪♪",
        }
        inten = synth_dict.get(inten)

    return inten


# Write the metadata to the WebVTT file
def write_to_file(capvtt_file, start_time, end_time, inten):

    if meta_type == "light":
        hex_color, color_box = inten
        color_text = "{text-color: #" + f"{hex_color:06X}" + ";}"

        capvtt_file.write(f"{start_time} --> {end_time}{color_text}\n")
        capvtt_file.write(f"{color_box}#{hex_color:06X}\n")
    else:
        capvtt_file.write(f"{start_time} --> {end_time}\n")
        
        # Add ascii emojis if needed.
        if meta_type == "sound":
            capvtt_file.write("stoveon\n")
            capvtt_file.write(f"♪ {inten} ♪\n")
            capvtt_file.write("bell\n\n")
        elif meta_type == "vibration":
            capvtt_file.write(f"≋≋≋ {inten} ≋≋≋\n")
        else:
            capvtt_file.write("stoveon\n")
            capvtt_file.write(f"{inten}\n")
            capvtt_file.write("bell\n\n")



# Detect the events in the pressure data and write the metadata to the WebVTT file
def detect_events_with_inten(df, meta_out_file):

    with open(meta_out_file, "w") as capVttfile:
        # Write the WebVTT header to the file
        capVttfile.write("WEBVTT\n")
        capVttfile.write("Kind: metadata\n")
        capVttfile.write("Language: en\n\n")

        # Initialize variables to store the start and end times of the events, pressure values, event status, previous pressure value
        # and the last event line wrote to the file
        start_time = None
        prev_inten = None

        for index, row in df.iterrows():
            inten = determine_inten(df, index - 1)
            current_time = formatTime(row[time_column])
            if prev_inten is None:
                start_time = current_time
                prev_inten = inten
                continue
            if inten != prev_inten:
                end_time = current_time
                write_to_file(capVttfile, start_time, end_time, prev_inten)
                start_time = current_time
                prev_inten = inten
        if start_time is not None and prev_inten is not None:
            end_time = formatTime(df.iloc[-1][time_column])
            write_to_file(capVttfile, start_time, end_time, prev_inten)


# Helper function to format time in milliseconds to HH:MM:SS.mmm format
def formatTime(mseconds):
    seconds = mseconds / 1000
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    mseconds = int(mseconds % 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}.{mseconds:03}"


# Obtain the file path to the air.csv file and the type of feedback to create metadata for
air_file = sys.argv[1]
meta_type = sys.argv[2]

inten_range = determine_type()

# Read the air.csv file into a pandas dataframe
air_df = pd.read_csv(air_file)

# Column names
time_column = "Time"
pressure_column = "Pa"
parameterized_pressure_column = "P1"

# Create the metadata output file path
input_dir = os.path.dirname(air_file)
meta_out_file = os.path.join(input_dir, meta_type + ".vtt")

detect_events_with_inten(air_df, meta_out_file)
