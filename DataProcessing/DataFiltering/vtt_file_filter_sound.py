import csv

def detect_events_with_meter(csv_file_path, vtt_file_path, threshold=99000, numBoxes=12, offset=2000):
    maxPa = float('-inf')
    with open(csv_file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            pa = float(row['Pa'])
            if pa > maxPa:
                maxPa = pa

    with open(csv_file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    with open(vtt_file_path, 'w') as vttfile:
        vttfile.write("WEBVTT\n")
        vttfile.write("Kind: captions\n")
        vttfile.write("Language: en\n\n")

        vttfile.write("00:00:00.000 --> 00:00:01.000 align:start position:0%\n")
        vttfile.write("Sound: stoveOn\n\n")

        previous_val = None
        previous_start_time = None
        previous_end_time = None

        for row in rows:
            time = float(row['Time'])
            pa = float(row['Pa'])
            kpa = pa / 1000

            scaleMin = threshold - offset
            scaleMax = maxPa
            scaleRange = scaleMax - scaleMin

            pa = max(scaleMin, min(pa, scaleMax))

            filledBoxes = int((pa - scaleMin) / scaleRange * numBoxes) if pa >= threshold else 0
            val = filledBoxes

            if previous_val is not None and val == previous_val:
                previous_end_time = time + 310
            else:
                if previous_val is not None:
                    startTime = formatTime(previous_start_time)
                    endTime = formatTime(previous_end_time)
                    vttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
                    vttfile.write(f"Boxes: {previous_val}\n\n")

                previous_val = val
                previous_start_time = time
                previous_end_time = time + 310

        if previous_val is not None:
            startTime = formatTime(previous_start_time)
            endTime = formatTime(previous_end_time)
            vttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
            vttfile.write(f"Boxes: {previous_val}\n\n")

        end_time = float(rows[-1]['Time']) + 1000
        end_time_str = formatTime(end_time)
        end_time_plus_1_str = formatTime(end_time + 1000)
        vttfile.write(f"{end_time_str} --> {end_time_plus_1_str} align:start position:0%\n")
        vttfile.write("Sound: bell\n\n")

def formatTime(mseconds):
    seconds = mseconds / 1000
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    mseconds = int(mseconds % 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}.{mseconds:03}"


csv_file_path = 'MadL_bend2.csv'
vtt_file_path = 'MadL_bendCap.vtt'
detect_events_with_meter(csv_file_path, vtt_file_path)
