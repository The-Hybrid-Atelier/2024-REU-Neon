"""

air2cap.py

This script processes the extracted data from raw2air.py (air.csv) and creates a WebVTT file with captions for the data spikes.

Function:
---------
1. find_max_pa(df):
    - Finds the maximum pressure value in the dataframe.
    Parameters:
    -----------
    - df: pandas.DataFrame
        The dataframe containing the pressure data.
    Returns:
    --------
    - The maximum pressure value in the dataframe.

2. find_min_pa(df):
    - Finds the minimum pressure value in the dataframe.
    Parameters:
    -----------
    - df: pandas.DataFrame
        The dataframe containing the pressure data.
    Returns:
    --------
    - The minimum pressure value in the dataframe.

3. parameterize_pressure(df, max_pressure, min_pressure):
    - Normalizes the pressure data between 0 and 1.
    Parameters:
    -----------
    - df: pandas.DataFrame
        The dataframe containing the pressure data.
    - max_pressure: float
        The maximum pressure value in the dataframe.
    - min_pressure: float
        The minimum pressure value in the dataframe.
    Returns:
    --------
    - The dataframe with a new column ' P1' containing the normalized pressure values.

4. create_meter(df, i, num_boxes=15):
    - Creates a meter with filled and empty boxes based on the normalized pressure value.
    Parameters:
    -----------
    - df: pandas.DataFrame
        The dataframe containing the pressure data.
    - i: int
        The index of the dataframe.
    - num_boxes: int
        The number of boxes to display in the meter.
    Returns:
    --------
    - A string representing the meter with filled and empty boxes.

5. write_to_file(capvtt_file, start_time, end_time, pressure, meter):
    - Writes the caption data to the WebVTT file.
    Parameters:
    -----------
    - capvtt_file: file
        The file object to write the caption data.
    - start_time: str
        The start time of the caption.
    - end_time: str
        The end time of the caption.
    - pressure: float
        The pressure value.
    - meter: str
        The meter representation of the pressure value.

6. detect_events_with_meter(csv_file_path, capVtt_file_path):
    - Detects events in the pressure data and writes the caption data to a WebVTT file.
    Parameters:
    -----------
    - csv_file_path: str
        The path to the CSV file containing the pressure data.
    - capVtt_file_path: str
        The path to the output WebVTT file.

7. detect_peaks_in_range(csv_file_path, capVtt_file_path):
    - Detects peaks in the pressure data and writes the caption data to a WebVTT file.
    Parameters:
    -----------
    - csv_file_path: str
        The path to the CSV file containing the pressure data.
    - capVtt_file_path: str
        The path to the output WebVTT file.

8. detect_valleys_in_range(csv_file_path, capVtt_file_path):
    - Detects valleys in the pressure data and writes the caption data to a WebVTT file.
    Parameters:
    -----------
    - csv_file_path: str
        The path to the CSV file containing the pressure data.
    - capVtt_file_path: str
        The path to the output WebVTT file.

9. detect_rise_in_range(csv_file_path, capVtt_file_path):
    - Detects rise in the pressure data and writes the caption data to a WebVTT file.
    Parameters:
    -----------
    - csv_file_path: str
        The path to the CSV file containing the pressure data.
    - capVtt_file_path: str
        The path to the output WebVTT file.

10. detect_fall_in_range(csv_file_path, capVtt_file_path):
    - Detects fall in the pressure data and writes the caption data to a WebVTT file.
    Parameters:
    -----------
    - csv_file_path: str
        The path to the CSV file containing the pressure data.
    - capVtt_file_path: str
        The path to the output WebVTT file.

11. detect_steady_in_range(csv_file_path, capVtt_file_path):
    - Detects steady region in the pressure data and writes the caption data to a WebVTT file.
    Parameters:
    -----------
    - csv_file_path: str
        The path to the CSV file containing the pressure data.
    - capVtt_file_path: str
        The path to the output WebVTT file.


12. formatTime(mseconds):
    - Formats time in milliseconds to HH:MM:SS.mmm format.
    Parameters:
    -----------
    - mseconds: int
        The time in milliseconds.
    Returns:
    --------
    - The formatted time in HH:MM:SS.mmm format.

Notes:
------
- The script reads the extracted data from air.csv and processes the data to find events in the pressure data.
- It normalizes the pressure data between 0 and 1 to creates a meter representation of the pressure value.
"""

import pandas as pd
import sys
import os
from datetime import datetime, timedelta


# Function to find the maximum pressure value in the dataframe
def find_max_pa(df):
    return df[pressure_column].max()


# Function to find the minimum pressure value in the dataframe
def find_min_pa(df):
    return df[pressure_column].min()


# Function to normalize the pressure values between 0 and 1
def parameterize_pressure(df, max_pressure, min_pressure):
    df[parameterized_pressure_column] = (
        (df[pressure_column] - min_pressure) / (max_pressure - min_pressure)
    ).round(2)
    return df

#Function to create a pressure meter with filled and empty boxes based on the pressure parameterized value
def create_meter(df, i, num_boxes=12):
    # Create the meter with filled and empty boxes based on the pressure parameterized value
    p1_value = df.iloc[i][parameterized_pressure_column]
    filledBoxes = int(p1_value * num_boxes)
    meter = "■" * filledBoxes + "□" * (num_boxes - filledBoxes)
    return meter


def write_to_file(capvtt_file, start_time, end_time, pressure, meter, label):

    if(label != "significant_event_0.03"):
        capvtt_file.write(f"{label}\n\n")
    
    capvtt_file.write(f"{start_time} --> {end_time}\n")

    # Only write meter and pressure if they are not None
    if pressure is not None and meter is not None:
        capvtt_file.write(f"{meter} {pressure} kPa\n\n")
    else:
        capvtt_file.write("\n")  # Just write a blank line if no meter/pressure

def ifttt_to_file(input_vtt_file, output_vtt_file, df):
    # Read input file and parse pressure values
    pressure_values = []
    with open(input_vtt_file, "r") as infile:
        lines = infile.readlines()
    
    # Extract pressure values from file
    for line in lines:
        if "kPa" in line:
            try:
                pressure = float(line.split()[-2])  # Assuming pressure is second last before 'kPa'
                pressure_values.append(pressure)
            except ValueError:
                continue

    if not pressure_values:
        print("No valid pressure values found in input file.")
        return

    # Find min and max pressure
    max_pressure = find_max_pa(df)
    min_pressure = find_min_pa(df)

    # Define music note pressure ranges (evenly spaced between min and max)
    note_ranges = [
        (min_pressure + (max_pressure - min_pressure) * i / 6, 
         min_pressure + (max_pressure - min_pressure) * (i + 1) / 6) 
        for i in range(6)
    ]
    
    #print(f" note ranges: {note_ranges}")

    # Open output file for writing
    # Open output file for writing
    with open(output_vtt_file, "w") as outfile:

        # Process input again to write output with notes
        for i, line in enumerate(lines):
            if "kPa" in line:
                try:
                    pressure = float(line.split()[-2]) * 1000

                    #print(f"pressure: {pressure}")

                    if(pressure > 0):
                        note_count = sum(1 for min_p, max_p in note_ranges if min_p <= pressure < max_p)
                        outfile.write(f"{note_count}\n\n") #print the note count
                        #notes = "♪" * note_count  
                        #outfile.write(f"{notes}\n\n")  # Write only the notes, skipping the pressure value line

                        #print(note_count)
                except ValueError:
                    continue
            else:
                if((not("peak" in line)) and (not("valley" in line)) and (not("rise" in line)) and (not("fall" in line)) and (not("steady" in line))):
                    outfile.write(line)  # Keep other lines (timestamps, labels, etc.) 



def detect_events_with_meter(df, capVtt_file_path):

    # Find the maximum and minimum pressure values in the dataframe
    maxPa = find_max_pa(df)
    minPa = find_min_pa(df)

    # Normalize the pressure values between 0 and 1, add it to the dataframe
    df = parameterize_pressure(df, maxPa, minPa)

    with open(capVtt_file_path, "w") as capVttfile:
        # Write the WebVTT header to the file
        capVttfile.write("WEBVTT\n")
        capVttfile.write("Kind: captions\n")
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

            # Get the current pressure value convert to kpa and the current P1 value
            current_pressure = round(df.iloc[i][pressure_column] / 1000, 2)
            p1_current_value = df.iloc[i][parameterized_pressure_column]

            # Check if the current P1 value is greater than 0.03, indicating an event
            if p1_current_value > 0.03:

                # Check if the event is the same as the previous event, if not write the previous time and pressure values
                if not event and current_pressure != previous_pressure and i != 0:

                    # Get the start and end time of the previous pressure value
                    end_time = df.iloc[i - 1][time_column]
                    end_time = formatTime(end_time)

                    # Get the pressure value before the event and convert to kPa
                    prev_press = round(df.iloc[i - 1][pressure_column] / 1000, 2)

                    # Create meter
                    meter = create_meter(df, i - 1)

                    # Write the data to the vtt file
                    write_to_file(capVttfile, start_time, end_time, prev_press, meter, "significant_event_0.03")

                    # Update the start time for the next event
                    start_time = end_time

                # Get the end time of the event (spike)
                end_time = df.iloc[i][time_column]
                end_time = formatTime(end_time)

                # Create pressure meter
                meter = create_meter(df, i)

                # Write the data to the vtt file
                write_to_file(capVttfile, start_time, end_time, current_pressure, meter, "significant_event_0.03")

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
            end_time = df.iloc[last_line][time_column]
            end_time = formatTime(end_time)

            # Create meter
            meter = create_meter(df, last_line)

            # Write the data to the vtt file
            write_to_file(capVttfile, start_time, end_time, current_pressure, meter, "meter")

    return df

# detect rises in a given time frame
# use the first and second derivatives of the air pressure data to find the peaks
def detect_peaks(df, capVtt_file_path):
    # Find the maximum and minimum pressure values
    maxPa = find_max_pa(df)
    minPa = find_min_pa(df)

    # Normalize the pressure values between 0 and 1
    df = parameterize_pressure(df, maxPa, minPa)

    # Compute first and second derivatives
    df["first_derivative"] = df[pressure_column].diff()
    df["second_derivative"] = df["first_derivative"].diff()

    with open(capVtt_file_path, "w") as capVttfile:
        # Write WebVTT file header
        capVttfile.write("WEBVTT\n")
        capVttfile.write("Kind: captions\n")
        capVttfile.write("Language: en\n\n")

        # Iterate through dataframe, looking for peaks
        for i in range(1, len(df) - 1):
            current_pressure = round(df.iloc[i][pressure_column] / 1000, 2)

            p1_current_value = df.iloc[i][parameterized_pressure_column]

            # Use second derivative to confirm peak
            if df.iloc[i]["second_derivative"] < 0 and df.iloc[i]["first_derivative"] > 0 and p1_current_value > 0.03:
                start_time = formatTime(df.iloc[i][time_column])
                end_time = formatTime(df.iloc[i + 1][time_column])
                meter = create_meter(df, i)

                # Write peak information to the VTT file
                write_to_file(capVttfile, start_time, end_time, current_pressure, meter, "peak")

            else:
                # For non-peak, write only the timestamp without pressure
                start_time = formatTime(df.iloc[i][time_column])
                end_time = formatTime(df.iloc[i + 1][time_column])
                write_to_file(capVttfile, start_time, end_time, None, None, "")  # Empty entry for non-peak


    return df


# detect valleys in a given time range
# use the first and second derivatives of the air pressure data to find the valleys
def detect_valleys(df, capVtt_file_path):
    # Find the maximum and minimum pressure values
    maxPa = find_max_pa(df)
    minPa = find_min_pa(df)

    # Normalize the pressure values between 0 and 1
    df = parameterize_pressure(df, maxPa, minPa)

    # Compute first and second derivatives
    df["first_derivative"] = df[pressure_column].diff()
    df["second_derivative"] = df["first_derivative"].diff()

    with open(capVtt_file_path, "a") as capVttfile:
        # Write WebVTT file header
        # capVttfile.write("WEBVTT\n")
        # capVttfile.write("Kind: captions\n")
        # capVttfile.write("Language: en\n\n")

        # Iterate through dataframe, looking for valleys
        for i in range(1, len(df) - 1):
            current_pressure = round(df.iloc[i][pressure_column] / 1000, 2)
            p1_current_value = df.iloc[i][parameterized_pressure_column]

            # Use second derivative to confirm valley
            if df.iloc[i]["second_derivative"] > 0 and df.iloc[i]["first_derivative"] < 0 and p1_current_value > 0.03:
                start_time = formatTime(df.iloc[i][time_column])
                end_time = formatTime(df.iloc[i + 1][time_column])
                meter = create_meter(df, i)

                # Write valley information to the VTT file
                write_to_file(capVttfile, start_time, end_time, current_pressure, meter, "valley")

    return df


# detect rise in a given time range
# use the first derivative of the air pressure data to find the rise regions
def detect_rise(df, capVtt_file_path):
    # Find the maximum and minimum pressure values
    maxPa = find_max_pa(df)
    minPa = find_min_pa(df)

    # Normalize the pressure values between 0 and 1
    df = parameterize_pressure(df, maxPa, minPa)

    # Compute first derivative
    df["first_derivative"] = df[pressure_column].diff()

    with open(capVtt_file_path, "a") as capVttfile:
        # Write WebVTT file header
        # capVttfile.write("WEBVTT\n")
        # capVttfile.write("Kind: captions\n")
        # capVttfile.write("Language: en\n\n")

        # Iterate through dataframe, looking for rise
        for i in range(1, len(df) - 1):
            current_pressure = round(df.iloc[i][pressure_column] / 1000, 2)
            p1_current_value = df.iloc[i][parameterized_pressure_column]

            # Use first derivative to confirm rise
            if df.iloc[i]["first_derivative"] > 0 and p1_current_value > 0.03:
                start_time = formatTime(df.iloc[i][time_column])
                end_time = formatTime(df.iloc[i + 1][time_column])
                meter = create_meter(df, i)

                # Write rise information to the VTT file
                write_to_file(capVttfile, start_time, end_time, current_pressure, meter, "rise")

    return df


# detect fall in a given time range
# use the first derivative of the air pressure data to find the fall regions
def detect_fall(df, capVtt_file_path):
    # Find the maximum and minimum pressure values
    maxPa = find_max_pa(df)
    minPa = find_min_pa(df)

    # Normalize the pressure values between 0 and 1
    df = parameterize_pressure(df, maxPa, minPa)

    # Compute first derivative
    df["first_derivative"] = df[pressure_column].diff()


    with open(capVtt_file_path, "a") as capVttfile:
        # Write WebVTT file header
        # capVttfile.write("WEBVTT\n")
        # capVttfile.write("Kind: captions\n")
        # capVttfile.write("Language: en\n\n")

        # Iterate through dataframe, looking for fall
        for i in range(1, len(df) - 1):
            current_pressure = round(df.iloc[i][pressure_column] / 1000, 2)
            p1_current_value = df.iloc[i][parameterized_pressure_column]

            # Use first derivative to confirm fall
            if df.iloc[i]["first_derivative"] < 0 and p1_current_value > 0.03:
                start_time = formatTime(df.iloc[i][time_column])
                end_time = formatTime(df.iloc[i + 1][time_column])
                meter = create_meter(df, i)

                # Write fall information to the VTT file
                write_to_file(capVttfile, start_time, end_time, current_pressure, meter, "fall")

    return df


# detect steady in a given time range
# use the first derivative of the air pressure data to find the steady regions
def detect_steady(df, capVtt_file_path):
    # Find the maximum and minimum pressure values
    maxPa = find_max_pa(df)
    minPa = find_min_pa(df)

    # Normalize the pressure values between 0 and 1
    df = parameterize_pressure(df, maxPa, minPa)

    # Compute first derivative
    df["first_derivative"] = df[pressure_column].diff()

    with open(capVtt_file_path, "a") as capVttfile:
        # Write WebVTT file header
        # capVttfile.write("WEBVTT\n")
        # capVttfile.write("Kind: captions\n")
        # capVttfile.write("Language: en\n\n")

        # Iterate through dataframe, looking for steady regions
        for i in range(1, len(df) - 1):
            current_pressure = round(df.iloc[i][pressure_column] / 1000, 2)
            p1_current_value = df.iloc[i][parameterized_pressure_column]

            # Use first derivative to confirm steady
            if df.iloc[i]["first_derivative"] == 0 and p1_current_value > 0.03:
                start_time = formatTime(df.iloc[i][time_column])
                end_time = formatTime(df.iloc[i + 1][time_column])
                meter = create_meter(df, i)

                # Write steady information to the VTT file
                write_to_file(capVttfile, start_time, end_time, current_pressure, meter, "steady")

    return df





# Helper function to format time in milliseconds to HH:MM:SS.mmm format
def formatTime(mseconds):
    seconds = mseconds / 1000
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    mseconds = int(mseconds % 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}.{mseconds:03}"


# Get the path to the csv file containing the pressure data
csv_file_path = sys.argv[1]
input_dir = os.path.dirname(csv_file_path)
capvtt_out_file = os.path.join(input_dir, "meter.vtt")
capvtt_out_file_ifttt = os.path.join(input_dir, "ifttt_general.vtt")

# Define the column names for the time, pressure, and parameterized pressure values
time_column = "Time"
pressure_column = "Pa"
parameterized_pressure_column = "P1"

# Read the csv file containing the pressure data into a pandas dataframe
try:
    raw_df = pd.read_csv(csv_file_path)
except IsADirectoryError:
    sys.exit(1)
    
# Detect events in the pressure data and write the caption data to a WebVTT file, then save the updated dataframe to the csv file
air_df = detect_events_with_meter(raw_df, capvtt_out_file)
air_df2 = detect_peaks(raw_df, capvtt_out_file_ifttt)
#air_df2 = detect_valleys(raw_df, capvtt_out_file_ifttt)  
air_df2 = detect_rise(raw_df, capvtt_out_file_ifttt)    
#air_df2 = detect_fall(raw_df, capvtt_out_file_ifttt)    
#air_df2 = detect_steady(raw_df, capvtt_out_file_ifttt)

air_df.to_csv(csv_file_path, index=False)
air_df2.to_csv(csv_file_path, index=False)


print(f"Output file is being saved to: {capvtt_out_file}")
print(f"Output file is being saved to: {capvtt_out_file_ifttt}")

capvtt_out_file_ifttt_output = os.path.join(input_dir, "ifttt.vtt")

print("ifttt general file begins")
ifttt_to_file(capvtt_out_file_ifttt, capvtt_out_file_ifttt_output, raw_df)
print("ifttt general file ends")

