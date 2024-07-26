import csv

def detect_events_with_meter(csv_file_path, capVtt_file_path, metaVtt_file_path, threshold=99000, numBoxes=12, offset=2000):
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

    with open(capVtt_file_path, 'w') as capVttfile, open(metaVtt_file_path, 'w') as metaVttfile:
        capVttfile.write("WEBVTT\n")
        capVttfile.write("Kind: captions\n")
        capVttfile.write("Language: en\n\n")

        metaVttfile.write("WEBVTT\n")
        metaVttfile.write("Kind: metadata\n")
        metaVttfile.write("Language: en\n\n")


        if rows:
            first_time = float(rows[0]['Time'])
            start_time_str = formatTime(first_time - 1000)
            end_time_str = formatTime(first_time)
            capVttfile.write(f"{start_time_str} --> {end_time_str} align:start position:0%\n")
            capVttfile.write("Sound: stoveOn\n")

        previous_val = None
        previous_start_time = None
        previous_end_time = None
        
        for row in rows:
            time = float(row['Time'])
            pa = float(row['Pa'])
            kpa = pa / 1000
            # time = time*1000 #comment this line out depending of the format of time, in if the time is in seconds

            scaleMin = threshold - offset
            scaleMax = maxPa
            scaleRange = scaleMax - scaleMin

            pa = max(scaleMin, min(pa, scaleMax))

            filledBoxes = int((pa - scaleMin) / scaleRange * numBoxes)
            val = filledBoxes

            meter = "■" * filledBoxes + "□" * (numBoxes - filledBoxes)

            if previous_val is not None and val == previous_val:
                previous_end_time = time + 310
            else:
                if previous_val is not None:
                    startTime = formatTime(previous_start_time)
                    endTime = formatTime(previous_end_time)
                    # vttfile.write(f"NextSound : {previous_val}\n")
                    # vttfile.write(f"NextVibrationSpeed : {previous_val}\n")
                    # vttfile.write(f"NextLightInten : {previous_val}\n\n")
                    # vttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
                    # vttfile.write(f"Sound : {previous_val}\n")
                    # vttfile.write(f"LightInten : {previous_val}\n")
                    # vttfile.write(f"VibrationSpeed : {previous_val}\n")
                    # vttfile.write(f"Duration : {previous_end_time - previous_start_time}\n")

                    capVttfile.write(f"NextSound : {previous_val}\n")
                    capVttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
                    capVttfile.write(f"Sound : {previous_val}\n")
                    capVttfile.write(f"Duration : {previous_end_time - previous_start_time}\n")

                    metaVttfile.write(f"{startTime} --> {endTime}\n")
                    metaVttfile.write(f"{meter}  {kpa:.2f} kPa\n\n")

                previous_val = val
                previous_start_time = time
                previous_end_time = time + 310

        if previous_val is not None:
            startTime = formatTime(previous_start_time)
            endTime = formatTime(previous_end_time)
            # vttfile.write(f"NextSound : {previous_val}\n")
            # vttfile.write(f"NextVibrationSpeed : {previous_val}\n")
            # vttfile.write(f"NextLightInten : {previous_val}\n\n")
            # vttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
            # vttfile.write(f"Sound : {previous_val}\n")
            # vttfile.write(f"LightInten : {previous_val}\n")
            # vttfile.write(f"VibrationSpeed : {previous_val}")
            # vttfile.write(f"Duration : {previous_end_time - previous_start_time}\n")

            capVttfile.write(f"NextSound : {previous_val}\n")
            capVttfile.write(f"{startTime} --> {endTime} align:start position:0%\n")
            capVttfile.write(f"Sound : {previous_val}\n")
            capVttfile.write(f"Duration : {previous_end_time - previous_start_time}\n")
            
            metaVttfile.write(f"{startTime} --> {endTime}\n")
            metaVttfile.write(f"{meter}  {kpa:.2f} kPa\n\n")


        end_time = float(rows[-1]['Time']) + 1000
        end_time_str = formatTime(end_time)
        end_time_plus_1_str = formatTime(end_time + 1000)

        capVttfile.write(f"{end_time_str} --> {end_time_plus_1_str} align:start position:0%\n")
        capVttfile.write("Sound: bell\n\n")

def formatTime(mseconds):
    seconds = mseconds / 1000
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    mseconds = int(mseconds % 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}.{mseconds:03}"

# Ex
csv_file_path = 'MadL_bend2.csv'
capVtt_file_path = 'MadL_bendCap.vtt'
metaVtt_file_path = 'MadL_bendMeta.vtt'
detect_events_with_meter(csv_file_path, capVtt_file_path, metaVtt_file_path)
