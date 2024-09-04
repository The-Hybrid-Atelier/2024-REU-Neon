"""
Author: Joel Beauregard

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
    meta_dict = {"sound": 5, "light": 6, "synth": 100, "vibration": 5}
    return meta_dict.get(meta_type)


# Determine the itenisty of the feedback type based on the pressure parameterized value
def determine_inten(df, i):
    p1_value = df.iloc[i][parameterized_pressure_column]
    inten = int(p1_value * inten_range)

    # If the meta_type is light, convert the intensity to a hex color value
    if meta_type == "light":

        light_dict = {
            0: 0xFF0000,
            1: 0xFF7F00,
            2: 0xFFFF00,
            3: 0x00FF00,
            4: 0x0000FF,
            5: 0x4B0082,
            6: 0x8B00FF,
        }

        inten = light_dict.get(inten)

    return inten


# Write the metadata to the WebVTT file
def write_to_file(capvtt_file, start_time, end_time, inten):
    capvtt_file.write(f"{start_time} --> {end_time}\n")

    if meta_type == "light":
        capvtt_file.write(f"#{inten:06X}\n\n")
    else:
        capvtt_file.write(f"{inten}\n\n")


# Detect the events in the pressure data and write the metadata to the WebVTT file
def detect_events_with_inten(df, meta_out_file):

    with open(meta_out_file, "w") as capVttfile:
        # Write the WebVTT header to the file
        capVttfile.write("WEBVTT\n")
        capVttfile.write("Kind: metadata\n")
        capVttfile.write("Language: en\n\n")

        # Initialize variables to store the start and end times of the events, pressure values, event status, previous pressure value
        # and the last event line wrote to the file
        start_time = formatTime(df.iloc[0][time_column])
        end_time = 0
        event = False
        previous_pressure = 0
        last_event_line = 0
        last_line = len(df) - 1

        # Iterate through the rows of the dataframe
        for i in range(0, len(df)):

            # Get the current pressure value convert to kpaand the current P1 value
            current_pressure = df.iloc[i][pressure_column]
            p1_current_value = df.iloc[i][parameterized_pressure_column]

            # Check if the current P1 value is greater than 0.03, indicating an event
            if p1_current_value > 0.03:

                # Check if the event is the same as the previous event, if not write the previous time and pressure values
                if not event and current_pressure != previous_pressure and i != 0:

                    # Get the start and end time of the previous pressure value
                    end_time = formatTime(df.iloc[i - 1][time_column])

                    # Create inten
                    inten = determine_inten(df, i - 1)

                    # Write the data to the vtt file
                    write_to_file(capVttfile, start_time, end_time, inten)

                    # Update the start time for the next event
                    start_time = end_time

                # Get the end time of the event (spike)
                end_time = formatTime(df.iloc[i][time_column])

                # Create pressure meter
                inten = determine_inten(df, i)

                # Write the data to the vtt file
                write_to_file(capVttfile, start_time, end_time, inten)

                # Update the tracking variables
                start_time = end_time
                event = True
                previous_pressure = current_pressure
                last_event_line = i

            # If the P1 value is less than 0.03, indicating no event, mark the event as False
            else:
                event = False

        # Check if the last event is the same as the previous event, if not write the last pressure to ensure all time values are written
        if last_event_line != last_line and previous_pressure != current_pressure:

            # End time
            end_time = formatTime(df.iloc[last_line][time_column])

            # Create meter
            inten = determine_inten(df, last_line)

            # Write the data to the vtt file
            write_to_file(capVttfile, start_time, end_time, inten)


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
