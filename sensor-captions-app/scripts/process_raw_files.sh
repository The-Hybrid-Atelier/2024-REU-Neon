#!/bin/bash

# Define the base directory
BASE_DIR="../data"

# Define the Python script to run
PYTHON_SCRIPT="../scripts/raw2air.py"

# Find all raw.csv files in the data directory and its subdirectories
find "$BASE_DIR" -type f -name "raw.csv" | while read -r raw_file; do
    # Run the Python script on each raw.csv file
    python "$PYTHON_SCRIPT" "$raw_file"
done