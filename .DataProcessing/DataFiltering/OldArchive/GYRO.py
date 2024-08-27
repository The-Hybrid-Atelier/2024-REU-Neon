import matplotlib.pyplot as plt
import pandas as pd
import os

def read_and_plot(filepaths):
    plt.figure(figsize=(12, 6))

    for filepath in filepaths:
        if not os.path.isfile(filepath):
            print(f"{filepath} not working.")
            continue
        
        column_names = [
            "Time", "Acc_X", "Acc_Y", "Acc_Z", "Gyr_X", "Gyr_Y", "Gyr_Z",
            "Mag_X", "Mag_Y", "Mag_Z", "Temp", "Pa", "PSI", "atm"
        ]
        data = pd.read_csv(filepath, names=column_names, skiprows=1)

        data["Time"] = data["Time"] - data["Time"].iloc[0]

        plt.plot(data["Time"], data["Gyr_X"], label=f'{os.path.basename(filepath)} - GYRO X')
        plt.plot(data["Time"], data["Gyr_Y"], label=f'{os.path.basename(filepath)} - GYRO Y')
        plt.plot(data["Time"], data["Gyr_Z"], label=f'{os.path.basename(filepath)} - GYRO Z')
    
    plt.xlabel('Time')
    plt.ylabel('GYRO Values')
    plt.title('GYRO X, Y, Z over Time')
    plt.legend()
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    filepaths = ["bend1.csv"]
   read_and_plot(filepaths)
