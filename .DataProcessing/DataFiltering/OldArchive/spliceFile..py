import pandas as pd
from io import StringIO
import os

def read_and_clean_data(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()
    
    # Removes the first few linees
    cleaned_lines = [line for line in lines if 'Test1.txt File Created' not in line and 'IMU Output: Scaled' not in line]
    
    # add the good lines to the data frame
    cleaned_data = StringIO(''.join(cleaned_lines))
    
    df = pd.read_csv(cleaned_data)
    df.columns = ["Time", "Acc_X", "Acc_Y", "Acc_Z", "Gyr_X", "Gyr_Y", "Gyr_Z",
                  "Mag_X", "Mag_Y", "Mag_Z", "Temp", "Pa", "PSI", "atm"]
    return df

def calculate_average_pressure(df, num_lines=5):
    return df['Pa'].iloc[:num_lines].mean()

def dataSpike(df, column="Pa", pressure_threshold=None):
    if pressure_threshold is None:
        average_pressure = calculate_average_pressure(df)
        pressure_threshold = average_pressure + 500
    spikes = df[df[column] > pressure_threshold].index.tolist()
    return spikes

def extract_data(df, spikes, linesToRemovePreSpike=10, linesToRemoveAfterSpike=10):
    if not spikes:
        return pd.DataFrame()
    
    start_idx = 0
    end_idx = len(df) - 1

    # Find the first spike
    for idx in spikes:
        if idx >= linesToRemovePreSpike:
            start_idx = idx - linesToRemovePreSpike
            break

    # Find the last spike
    for idx in reversed(spikes):
        if idx <= len(df) - linesToRemoveAfterSpike:
            end_idx = idx + linesToRemoveAfterSpike
            break
    
    extracted_df = df.iloc[start_idx:end_idx + 1]
    return extracted_df

def save_data(df, file_path):
    df.to_csv(file_path, index=False)

def process_file(input_file, output_file, column='Pa', linesToRemovePreSpike=10, linesToRemoveAfterSpike=10):
    df = read_and_clean_data(input_file)
    spikes = dataSpike(df, column)
    extracted_df = extract_data(df, spikes, linesToRemovePreSpike, linesToRemoveAfterSpike)
    save_data(extracted_df, output_file)

inputfilepaths = ["fbend1.csv"]
print(f"Current working directory: {os.getcwd()}")

for input_file in inputfilepaths:
    if not os.path.exists(input_file):
        print(f"File not found: {input_file}")
    else:
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}EX.csv"

        process_file(input_file, output_file)
        print(f"Processed file saved to {output_file}")
