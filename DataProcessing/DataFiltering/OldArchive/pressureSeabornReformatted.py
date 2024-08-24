import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import os

# Global variables for font scale and line width
FONT_SCALE = 1.5
LINE_WIDTH = 2.5

def read_and_plot(filepaths):
    plt.figure(figsize=(12, 6))  # Set the size of the plot
    sns.set(style="whitegrid", font_scale=FONT_SCALE)  # Use the whitegrid style and larger font size

    for filepath in filepaths:
        if not os.path.isfile(filepath):
            print(f"{filepath} not found.")
            continue

        # Read the data into a DataFrame
        column_names = [
            "Time", "Acc_X", "Acc_Y", "Acc_Z", "Gyr_X", "Gyr_Y", "Gyr_Z",
            "Mag_X", "Mag_Y", "Mag_Z", "Temp", "Pa", "PSI", "atm"
        ]
        data = pd.read_csv(filepath, names=column_names, skiprows=1)

        # Convert Time from milliseconds to seconds
        data["Time"] = (data["Time"] - data["Time"].iloc[0]) / 1000.0

        # Convert Pressure from Pa to kPa
        data["Pa"] = data["Pa"] / 1000.0

        # Plot the data using Seaborn
        sns.lineplot(x="Time", y="Pa", data=data, linewidth=LINE_WIDTH)

    plt.xlabel('Time (s)')
    plt.ylabel('Pressure (kPa)')
    plt.title('Pressure over Time L Bend')
    # plt.legend()  # Legend is removed
    plt.show()

if __name__ == "__main__":
    filepaths = ["fbend1EX.csv"]
    read_and_plot(filepaths)

