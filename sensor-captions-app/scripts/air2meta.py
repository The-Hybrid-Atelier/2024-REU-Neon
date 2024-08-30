import pandas as pd
import sys
import os


def determine_inten(df, i, num_boxes=11):
    # Determine the itenisty of the sound need based on the pressure parameterized value
    p1_value = df.iloc[i][parameterized_pressure_column]
    inten = int(p1_value * num_boxes) + 1
    return inten

def write_to_file(capvtt_file, start_time, end_time, duration, inten):
    capvtt_file.write(f"{start_time} --> {end_time}\n")
    capvtt_file.write(f"{meta_type}: {inten}\n")
    capvtt_file.write(f"Duration: {duration}\n\n")

def detect_events_with_inten(df, meta_out_file):
    
    with open(meta_out_file, "w") as capVttfile:
        # Write the WebVTT header to the file
        capVttfile.write("WEBVTT\n")
        capVttfile.write("Kind: metadata\n")
        capVttfile.write("Language: en\n\n")

        # Initialize variables to store the start and end times of the events, pressure values, event status, previous pressure value
        # and the last event line wrote to the file
        start_time = df.iloc[0][time_column]
        start_time_str = formatTime(start_time)
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
                    end_time = df.iloc[i - 1][time_column]
                    end_time_str= formatTime(end_time)

                    # Get the duration
                    duration = end_time - start_time

                    # Create inten
                    inten = determine_inten(df, i - 1)

                    # Write the data to the vtt file
                    write_to_file(capVttfile, start_time_str, end_time_str, duration, inten)

                    # Update the start time for the next event
                    start_time = end_time
                    start_time_str = end_time_str

                # Get the end time of the event (spike)
                end_time = df.iloc[i][time_column]
                end_time_str = formatTime(end_time)

                duration = end_time - start_time

                # Create pressure meter
                inten = determine_inten(df, i)

                # Write the data to the vtt file
                write_to_file(capVttfile, start_time_str, end_time_str, duration, inten)

                # Update the tracking variables
                start_time = end_time
                start_time_str = end_time_str
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
            end_time_str = formatTime(end_time)

            #Get the duration
            duration = end_time - start_time

            # Create meter
            inten = determine_inten(df, last_line)

            # Write the data to the vtt file
            write_to_file(capVttfile, start_time_str, end_time_str, duration, inten)

# Helper function to format time in milliseconds to HH:MM:SS.mmm format
def formatTime(mseconds):
    seconds = mseconds / 1000
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    mseconds = int(mseconds % 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}.{mseconds:03}"


air_file = sys.argv[1]
meta_type = sys.argv[2]

air_df = pd.read_csv(air_file)

time_column = "Time"
pressure_column = "Pa"
parameterized_pressure_column = "P1"

input_dir = os.path.dirname(air_file)
meta_out_file = os.path.join(input_dir, "meta.vtt")

detect_events_with_inten(air_df, meta_out_file)