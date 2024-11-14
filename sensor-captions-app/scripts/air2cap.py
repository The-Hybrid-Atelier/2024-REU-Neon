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

7. formatTime(mseconds):
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


def write_to_file(capvtt_file, start_time, end_time, pressure, meter):
    capvtt_file.write(f"{start_time} --> {end_time}\n")
    capvtt_file.write(f"{meter} {pressure} kPa\n\n")


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

            # Get the current pressure value convert to kpaand the current P1 value
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
                    write_to_file(capVttfile, start_time, end_time, prev_press, meter)

                    # Update the start time for the next event
                    start_time = end_time

                # Get the end time of the event (spike)
                end_time = df.iloc[i][time_column]
                end_time = formatTime(end_time)

                # Create pressure meter
                meter = create_meter(df, i)

                # Write the data to the vtt file
                write_to_file(capVttfile, start_time, end_time, current_pressure, meter)

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
            write_to_file(capVttfile, start_time, end_time, current_pressure, meter)
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

# Define the column names for the time, pressure, and parameterized pressure values
time_column = "Time"
pressure_column = "Pa"
parameterized_pressure_column = "P1"

# Read the csv file containing the pressure data into a pandas dataframe
raw_df = pd.read_csv(csv_file_path)

# Detect events in the pressure data and write the caption data to a WebVTT file, then save the updated dataframe to the csv file
air_df = detect_events_with_meter(raw_df, capvtt_out_file)
air_df.to_csv(csv_file_path, index=False)
