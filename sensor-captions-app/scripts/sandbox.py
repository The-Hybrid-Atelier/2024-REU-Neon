
import pandas as pd
import math
import sys
import os


# Determine the range of feedback inten based on the meta_type parameter
def determine_type():
    meta_dict = {"sound": 5, "light": 6, "synth": 100, "vibration": 4}
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
            5: "stoveOn",
            6: "bell",
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

    return inten


# Write the metadata to the WebVTT file
def write_to_file(capvtt_file, start_time, end_time, inten):

    if meta_type == "light":
        hex_color, color_box = inten
        color_text = "{text-color: #" + f"{hex_color:06X}" + ";}"

        capvtt_file.write(f"{start_time} --> {end_time}{color_text}\n")
        capvtt_file.write(f"{color_box}#{hex_color:06X}\n\n")
    else:
        capvtt_file.write(f"{start_time} --> {end_time}\n")
        #Add ascii emojis if needed.
        if meta_type == "sound":
            capvtt_file.write(f"♪ {inten} ♪\n\n")
        else:
            capvtt_file.write(f"{inten}\n\n")


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
            inten = determine_inten(df, index-1)
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
