import matplotlib.pyplot as plt
import pandas as pd
import os

def read_and_plot(filepaths):
    plt.figure(figsize=(12, 6))#size of the data plot

    for filepath in filepaths:
        if not os.path.isfile(filepath):
            print(f"{filepath} not wokering.")
            continue
        
        # reads all the data into the data frame along with all the varaiables
        column_names = [
            "Time", "Acc_X", "Acc_Y", "Acc_Z","Gyr_X", "Gyr_Y", "Gyr_Z",
            "Mag_X", "Mag_Y", "Mag_Z","Temp", "Pa", "PSI", "atm"
        ]
        data = pd.read_csv(filepath, names=column_names, skiprows=1)#skip row just skips the labels
        
        #will basically eequalize the time
        data["Time"] = data["Time"] - data["Time"].iloc[0]

        # will plot all the points
        plt.plot(data["Time"], data["Pa"], label=os.path.basename(filepath))
    
    plt.xlabel('Time')
    plt.ylabel('Pressure (Pa)')
    plt.title('Pressure over Time L Bend')
    plt.legend()
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    filepaths = ["bend1.csv", "bend2.csv", "bend3.csv"]  # all the files i want in the graph
    #filepaths = ["bend1.csv", "bend2.csv", "bend3.csv", "rbend1.csv", "rbend2.csv"]
    #filepaths = ["bend1.csv", "rbend2.csv"]
    #filepaths = ["fbend1EX.csv"]  
    read_and_plot(filepaths)