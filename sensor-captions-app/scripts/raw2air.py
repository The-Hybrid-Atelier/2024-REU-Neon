"""
Author: Joel Beauregard

raw2air.py

This script processes raw CSV data and extracts the data between beginnging (beginning and end claps) to create a new CSV file.

Function:
-----------
1. calculate_average_pressure(df, num_lines=3):
    - Calculates the average pressure from the first 'num_lines' of the dataframe.
    Parameters:
    -----------
    - df: pandas.DataFrame
        The dataframe containing the pressure data.
    - num_lines: int
        The number of lines to consider for calculating the average pressure.
    Returns:
    --------
    - The average pressure calculated from the first 'num_lines' of the dataframe.

2. dataSpike(df, column=pressure_column):
    - Identifies data spikes in the pressure data based on a threshold, which is the average pressure plus 1500.
    Parameters:
    -----------
    - df: pandas.DataFrame
        The dataframe containing the  data.
    - column: str
        The column name containing the pressure data.
    Returns: 
    --------
    - A list of indexes in accordance with the dataframe where the pressure data exceeds the threshold.

3. remove_consect(spike_idxs):
    - Removes consecutive indexes from a list of indexes.
    Parameters:
    -----------
    - spike_idxs: list
        A list of indexes.
    Returns:
    --------
    - A list of indexes with consecutive indexes removed only keeping the first/last index of the consecutive indexes.

4. extract_data(df, spike_idxs):
    - Extracts the data between the beginning and end claps/spikes and adjust the time values accordingly.
    Parameters:
    -----------
    - df: pandas.DataFrame
        The dataframe containing the pressure and time data.
    - spike_idxs: list
        A list of indexes where the pressure data exceeds the threshold.
    Returns:
    --------
    - A new dataframe containing the data between the beginning and end claps/spikes with adjusted time values.

Function Workflow:
------------------
1. The script reads the raw CSV data from the input file into a pandas dataframe.
2. It then only selects the 'Time' and ' Pa' columns and corresponding data from the dataframe.
2. It processes the data finding the spikes in the pressure data and extracts the data between the beginning and end claps/spikes.
3. Finally, it writes the cleaned and structured data into a new CSV file.

Notes:
------
- The input file is expected to be in a specific raw CSV which the script is designed to handle.
- The output file will contain just data of time and pressure between the beginning and end claps/spikes.
- Will stil contain other spikes in the data, but only the data between the beginning and end claps/spikes will be extracted.

"""

import pandas as pd
import sys
import os


# Calculate the average pressure from 3 lines
def calculate_average_pressure(df, num_lines=3):
    return df[pressure_column].iloc[:num_lines].mean()


# Calculate what constitutes as a "spike" uses the average pressure + 1500 as the threshold
# Could possibly use stadard deviation as the leway to add to the threshold?
def dataSpike(df):
    average_pressure = calculate_average_pressure(df)
    pressure_threshold = average_pressure + 1500
    spikes = df[(df[pressure_column] > pressure_threshold)].index.tolist()
    spikes = remove_consect(spikes)
    return spikes


# Get the indexes of the spikes, and remove consecutive indexes
def remove_consect(spike_idxs):
    revised_idxs = []

    for i in range(len(spike_idxs) - 1):
        if spike_idxs[i] + 1 != spike_idxs[i + 1]:
            revised_idxs.append(spike_idxs[i])

    add_last = spike_idxs.index(revised_idxs[-1]) + 1
    revised_idxs.append(spike_idxs[add_last])
    return revised_idxs


# Extract the data from the end of the first spike (beginning clap) to the end of the beginning of the last spike (end clap)
def extract_data(df, spike_idxs):

    # If the claps have already been processed, convert time values to unix timestamps and offset the time values
    if not spike_idxs:
        df[time_column] = pd.to_datetime(df[time_column], format="%A,-%B-%d-%Y-%H:%M:%S")
        df[time_column] = df[time_column].apply(lambda x: int(x.timestamp())% 1000000)
        df[time_column] = (df[time_column] - df[time_column].iloc[0]) * 1000
        return df
    
    # Else if the claps have not been processed, process the claps and clean the data
    # Put in pressure values' spikes and their corresponding CSV line numbers into a dictionary
    spikes = {}

    for i in spike_idxs:
        value = df.iloc[i][pressure_column]
        spikes.update({value: i + 2})

    # Sort the dictionary by file lines, with the end of the first spike/clap being the first dict entry, and the start of the last spike/clap being the last dict entry
    spikes = dict(sorted(spikes.items(), key=lambda item: item[1]))

    # Gets the beginning and ending claps/spikes
    spikes_lines = spikes.values()
    correct_spikes_order = [
        [list(spikes)[0], list(spikes_lines)[0]],
        [list(spikes)[-1], list(spikes_lines)[-1]],
    ]

    # Get the line to start at & get the time to offset by after the beginning clap
    line_start = correct_spikes_order[0][1] - 1
    time_offset = df.iloc[line_start][time_column]

    # Get the line to end at
    line_end = correct_spikes_order[1][1]

    # Subtract the time offset from the time, getting the new time value
    for i in range(line_start, line_end - 2):
        current_time = df.iloc[i][time_column]
        new_time = current_time - time_offset
        df.at[i, time_column] = new_time

    # Only write at the end of the start spike and the beginning of the end spike
    extracted_df = df.iloc[line_start : line_end - 2]
    return extracted_df


# Read the csv file into a pandas dataframe
input_file = sys.argv[1]
df = pd.read_csv(input_file)
df = df.rename(columns={" Pa": "Pa"})

# Get columns that are needed
time_column = "Time"
pressure_column = "Pa"

# Select only the 'time' and 'pa' columns
selected_columns = df[[time_column, pressure_column]]

# Initialize spikes list and extracted_df dataframe
spikes = None
extracted_df = None

# If the raw file already has been processed, just need to offset the time values
if "-" in str(df.iloc[0][time_column]):
    extracted_df = extract_data(selected_columns, None)
else:
    # Get the spikes and extract the data in between the spikes (beginning and end claps)
    spikes = dataSpike(selected_columns)
    extracted_df = extract_data(selected_columns, spikes)

# Extract the directory path from the input file
input_dir = os.path.dirname(input_file)

# Construct the output file path
output_file = os.path.join(input_dir, "air.csv")

# Output the extracted data to a new csv file
extracted_df.to_csv(output_file, index=False)
