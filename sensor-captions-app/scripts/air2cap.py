import pandas as pd
import sys
import os


def cacl_avg_pressure(df, num_lines=5):
    return df[" Pa"].iloc[:num_lines].mean()


def find_max_pa(df):
    return df[" Pa"].max()


def find_min_pa(df):
    return df[" Pa"].min()


def parameterize_pressure(df, max_pressure, min_pressure):
    p1 = []
    for i in range(0, len(df)):
        current_pressure = df.iloc[i][" Pa"]
        p = round((current_pressure - min_pressure) / (max_pressure - min_pressure), 2)
        p1.append(p)
    df[" P1"] = p1
    return df


def create_meter(df, i, num_boxes=15):
    # Create the meter with filled and empty boxes based on the pressure value
    p2_value = df.iloc[i][" P1"]
    filledBoxes = int(p2_value * num_boxes)
    meter = "■" * filledBoxes + "□" * (num_boxes - filledBoxes)
    return meter


def write_to_file(capvtt_file, start_time, end_time, pressure, meter):
    capvtt_file.write(f"{start_time} --> {end_time}\n")
    capvtt_file.write(f"{meter} {pressure} kPa\n\n")


def detect_events_with_meter(csv_file_path, capVtt_file_path):

    df = pd.read_csv(csv_file_path)

    maxPa = find_max_pa(df)
    minPa = find_min_pa(df)

    df = parameterize_pressure(df, maxPa, minPa)

    with open(capVtt_file_path, "w") as capVttfile:
        # Write the WebVTT headers for captions and metadata files, respectively
        capVttfile.write("WEBVTT\n")
        capVttfile.write("Kind: captions\n")
        capVttfile.write("Language: en\n\n")

        # Initialize variables to store the start and end times of the events, pressure values, event status, previous pressure value
        # and the last event line wrote to the file
        start_time = formatTime(df.iloc[0]["Time"])
        end_time = 0
        event = False
        previous_pressure = 0
        last_event_line = 0

        # Iterate through the rows of the dataframe
        for i in range(0, len(df)):

            # Get the current pressure value convert to kpaand the current P1 value
            current_pressure = round(df.iloc[i][" Pa"] / 1000, 2)
            p1_current_value = df.iloc[i][" P1"]

            # Check if the current P1 value is greater than 0.03, indicating an event
            if p1_current_value > 0.03:

                # Check if the event is the same as the previous event, if not write the previous time and pressure values
                if not event and current_pressure != previous_pressure and i != 0:

                    # Get the start and end time of the previous pressure value
                    end_time = df.iloc[i - 1]["Time"]
                    end_time = formatTime(end_time)

                    # Get the pressure value before the event and convert to kPa
                    prev_press = round(df.iloc[i - 1][" Pa"] / 1000, 2)

                    # Create meter
                    meter = create_meter(df, i - 1)

                    # Write the data to the vtt file
                    write_to_file(capVttfile, start_time, end_time, prev_press, meter)

                    # Update the start time for the next event
                    start_time = end_time

                # Get the end time of the event (spike)
                end_time = df.iloc[i]["Time"]
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
        if last_event_line != len(df) - 1:

            # End time
            end_time = df.iloc[len(df) - 1]["Time"]
            end_time = formatTime(end_time)

            # Get the pressure value at the end
            pressure = df.iloc[len(df) - 1][" Pa"]

            # Create meter
            meter = create_meter(df, len(df) - 1)

            # Write the data to the vtt file
            write_to_file(capVttfile, start_time, end_time, pressure, meter)


# Helper function to format time in milliseconds to HH:MM:SS.mmm format
def formatTime(mseconds):
    seconds = mseconds / 1000
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    mseconds = int(mseconds % 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}.{mseconds:03}"


# Example usage
csv_file_path = sys.argv[1]
input_dir = os.path.dirname(csv_file_path)
capvtt_out_file = os.path.join(input_dir, "captions.vtt")

detect_events_with_meter(csv_file_path, capvtt_out_file)
