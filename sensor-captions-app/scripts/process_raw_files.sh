#!/bin/bash

# Define the base directory
BASE_DIR="../data"

# Define the Python script to run
RAW2_AIR_PYTHON_SCRIPT="../scripts/raw2air.py"
AIR2_CAP_PYTHON_SCRIPT="../scripts/air2cap.py"

# Find all raw.csv files in the data directory and its subdirectories, and run the Python script on each file
find "$BASE_DIR" -type f -name "raw.csv" | while read -r raw_file; do
    # Run the Python script on each raw.csv file
    python "$RAW2_AIR_PYTHON_SCRIPT" "$raw_file"
done

# Find all air.csv files in the data directory and its subdirectories, and run the Python script on each file to generate captions
find "$BASE_DIR" -type f -name "air.csv" | while read -r air_file; do
    # Run the Python script on each raw.csv file
    python "$AIR2_CAP_PYTHON_SCRIPT" "$air_file"
done