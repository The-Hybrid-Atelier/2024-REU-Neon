#!/usr/bin/env python
# coding: utf-8

# In[92]:


import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import os

import time 
import numpy as np

import serial
import serial.tools.list_ports

import bokeh.plotting 
import bokeh.io 
bokeh.io.output_notebook()


# In[95]:


HANDSHAKE = 0
VOLTAGE_REQUEST = 1
ON_REQUEST = 2
STREAM = 3
READ_DAQ_DELAY = 4

def find_arduino(port=None):
    """Get the name of the port that is connected to Arduino."""
    if port is None:
        ports = serial.tools.list_ports.comports()
        port = '/dev/cu.SLAB_USBtoUART'
    return port


def handshake_arduino(
    arduino, sleep_time=1, print_handshake_message=False, handshake_code=0
):
    """Make sure connection is established by sending
    and receiving bytes."""
    # Close and reopen
    arduino.close()
    arduino.open()

    # Chill out while everything gets set
    time.sleep(sleep_time)

    # Set a long timeout to complete handshake
    timeout = arduino.timeout
    arduino.timeout = 2

    # Read and discard everything that may be in the input buffer
    _ = arduino.read_all()
    time.sleep(sleep_time)

    # Send request to Arduino
    arduino.write(bytes([handshake_code]))
    #print(bytes([handshake_code]))

    # Read in what Arduino sent
    handshake_message = arduino.read_until()
    #print(handshake_message)

    # Send and receive request again
    arduino.write(bytes([handshake_code]))
    #time.sleep(sleep_time)
    handshake_message = arduino.read_until()

    # Print the handshake message, if desired
    if print_handshake_message:
        print("Handshake message: " + handshake_message.decode())

    # Reset the timeout
    arduino.timeout = timeout

def parse_raw(raw):
    """Parse bytes output from Arduino."""
    
    raw = raw.decode()
    
    if raw[-1] != "\n":
        print("Input must end with newline, otherwise message is incomplete.")
        raise ValueError(
            "Input must end with newline, otherwise message is incomplete."
        )
        

    t, Pa = raw.rstrip().split(",")

    return int(t), float(Pa)


# In[94]:


def daq_stream(arduino, n_data=100, delay=20):
    """Obtain `n_data` data points from an Arduino stream
    with a delay of `delay` milliseconds between each."""
    # Specify delay
    print(bytes([READ_DAQ_DELAY]) + (str(delay) + "x").encode())
    arduino.write(bytes([READ_DAQ_DELAY]) + (str(delay) + "x").encode())

    # Initialize output
    time_ms = np.empty(n_data)
    pressure = np.empty(n_data)

    # Turn on the stream
    arduino.write(bytes([STREAM]))

    # Receive data
    i = 0
    init_time = 0
    while i < n_data:
        raw = arduino.read_until()
        

        try:
            t, Pa = parse_raw(raw)
            if i == 0:
                init_time = t 
            if Pa > 80000:
                time_ms[i] = t - init_time
                pressure[i] = Pa
                i += 1
        except:
            print("Exception triggered")
            pass

    # Turn off the stream
    arduino.write(bytes([ON_REQUEST]))

    return pd.DataFrame({'time (ms)': time_ms, 'pressure (kPa)': pressure})


# In[96]:


port = find_arduino()
arduino = serial.Serial(port, baudrate=115200)
arduino.setDTR(False)
arduino.setRTS(False)


# In[97]:


handshake_arduino(arduino, handshake_code=HANDSHAKE, print_handshake_message=True)


# In[98]:


test_df = daq_stream(arduino, n_data=120, delay=150)


# In[102]:


filename = 'anasnewtest3.csv'
test_df.to_csv(filename, index=False)


# In[101]:


#filepaths = ['bend3.csv', 'bend1.csv', 'bend2.csv']
filepath = filename
column_names = [
            "time (ms)", "pressure (kPa)"
        ]
#anas_data = pd.read_csv(filepath, names=column_names, skiprows=1)
plt.figure(figsize=(12, 6))#size of the data plot
#plt.xticks(np.arange(expert_data['time (ms)'].min(), expert_data['time (ms)'].max(), 1000.0))

p1 = sns.lineplot(data=test_df, x=test_df['time (ms)'], y=test_df['pressure (kPa)']).set_title('anas data')


# ### Load Expert Data into DataFrame
# Preprocess to extract only breath information

# In[109]:


filepaths = ['bend3.csv', 'bend1.csv', 'bend2.csv', 'RohL_bend1.csv', 'RohL_rbend2.csv']
column_names = [
            "time (ms)", "Acc_X", "Acc_Y", "Acc_Z","Gyr_X", "Gyr_Y", "Gyr_Z",
            "Mag_X", "Mag_Y", "Mag_Z","Temp", "pressure (Pa)", "PSI", "atm"
        ]
for filepath in filepaths:
    expert_data_all = pd.read_csv(filepath, names=column_names, skiprows=1)#skip row just skips the labels
    expert_data = expert_data_all[['time (ms)', 'pressure (Pa)']]
    threshold = 99000 # Pa
    drop_idxs = []
    remove_flag = False
    for i in range(len(expert_data)):
        if remove_flag and expert_data.iloc[i, 1] < threshold:
            break
        if expert_data.iloc[i, 1] > threshold:
            drop_idxs.append(i) # Pa is on column 1 
            remove_flag = True
    expert_data = expert_data.drop(drop_idxs)
    expert_data['time (ms)']/=1000
    expert_data['pressure (Pa)'] /= 1000
    expert_data = expert_data.rename(columns={'time (ms)':'time (s)', 'pressure (Pa)':'pressure (kPa)'})
    export_name = filepath.replace('.csv', '') + 'filtered.csv'
    expert_data.to_csv(export_name, index=False)
#expert_data['time (ms)'] = expert_data["time (ms)"] - expert_data['time (ms)'].iloc[0]


# In[110]:


#filepaths = ['bend3.csv', 'bend1.csv', 'bend2.csv']
filepaths = ['RohL_bend1filtered.csv', 'RohL_rbend2filtered.csv', 'bend1filtered.csv', 'bend2filtered.csv', 'bend3filtered.csv']
column_names = [
            "time (ms)", "pressure (kPa)"
        ]


for filepath in filepaths:
    expert_data_all = pd.read_csv(filepath, names=column_names, skiprows=1)#skip row just skips the labels
    expert_data = expert_data_all[['time (ms)', 'pressure (kPa)']]
    threshold = 99 # Pa
    
    #remove_flag = False
    end = 0
    for i in range(len(expert_data)):
        if expert_data.iloc[i, 1] > threshold:
            end = i
            break
    expert_data = expert_data.iloc[0:end]
    export_name = filepath.replace('filtered.csv', '') + 'stats.csv'
    expert_data.to_csv(export_name, index=False)
    expert_data = expert_data['pressure (kPa)']
    
    mean = expert_data.mean()
    stddev = expert_data.std()
    print(mean)
    print(stddev)
    # for index, row in expert_data[::-1].iterrows():
    #     if row['pressure (kPa)'] < threshold:
    #         drop_idxs.append(index)
    #     else: 
    #         if len(drop_idxs) > 3:
    #             drop_idxs.pop()
    #             drop_idxs.pop()
    #             drop_idxs.pop()
    #         break
    # print(drop_idxs)
    # expert_data = expert_data.drop(drop_idxs)
    # export_name = filepath.replace('filtered.csv', '') + 'dtwfiltered.csv'
    # expert_data.to_csv(export_name, index=False)
#expert_data['time (ms)'] = expert_data["time (ms)"] - expert_data['time (ms)'].iloc[0]


# ### Graph Expert & Trial Data

# In[91]:


#size of the data plot
#sns.lineplot(data=test_df, x=test_df['time (ms)'], y=test_df['pressure (kPa)'])
plots = []
filepaths = ['bend1dtwfiltered.csv', 'bend2dtwfiltered.csv', 'bend3dtwfiltered.csv']
#filepaths = ['bend1filtered.csv', 'bend2filtered.csv', 'bend3filtered.csv']
count = 1
for filepath in filepaths:
    plt.figure(figsize=(12, 6))
    expert_data = pd.read_csv(filepath, names=column_names, skiprows=1)
    expert_data["dt"] = expert_data["time (ms)"].diff()
    expert_data["dP"] = expert_data["pressure (kPa)"].diff()
    plt.figure(figsize=(12, 6))#size of the data plot
    plt.xticks(np.arange(expert_data['time (ms)'].min(), expert_data['time (ms)'].max(), 1000.0))
    
    p1 = sns.lineplot(data=expert_data, x=expert_data['time (ms)'], y=expert_data['dP']).set_title('dP: Expert L Bend #' + str(count))

    plt.figure(figsize=(12, 6))#size of the data plot
    plt.xticks(np.arange(expert_data['time (ms)'].min(), expert_data['time (ms)'].max(), 1000.0))
    plt.yticks(np.arange(98000, expert_data['pressure (kPa)'].max(), 1000.0))
    p = sns.lineplot(data=expert_data, x=expert_data['time (ms)'], y=expert_data['pressure (kPa)'])
    p.set_title('Expert L Bend #' + str(count))
    plots.append(p)
    plots.append(p1)
    count+=1

    
rohfilepaths = ['RohL_bend1dtwfiltered.csv', 'RohL_rbend2dtwfiltered.csv']

rohdata = pd.read_csv('RohL_bend1dtwfiltered.csv', names = column_names, skiprows=1)
count = 1
for filepath in rohfilepaths:
    
    plt.figure(figsize=(12, 6))
    rohdata = pd.read_csv(filepath, names=column_names, skiprows=1)
    rohdata["dt"] = rohdata["time (ms)"].diff()
    rohdata["dP"] = rohdata["pressure (kPa)"].diff()

    plt.figure(figsize=(12, 6))#size of the data plot
    plt.xticks(np.arange(expert_data['time (ms)'].min(), expert_data['time (ms)'].max(), 1000.0))
    
    p1 = sns.lineplot(data=expert_data, x=expert_data['time (ms)'], y=expert_data['dP']).set_title('dP: novice L Bend #' + str(count))

    plt.figure(figsize=(12, 6))#size of the data plot
    plt.xticks(np.arange(expert_data['time (ms)'].min(), expert_data['time (ms)'].max(), 1000.0))
    plt.yticks(np.arange(98000, expert_data['pressure (kPa)'].max(), 1000.0))
    p = sns.lineplot(data=rohdata, x=rohdata['time (ms)'], y=rohdata['pressure (kPa)'])
    p.set_title('Novice L Bend #' + str(count))
    plots.append(p)
    count+=1


# In[48]:


plt.figure(figsize=(12, 6))#size of the data plot
#sns.lineplot(data=test_df, x=test_df['time (ms)'], y=test_df['pressure (kPa)'])
expert_data = pd.read_csv('bend1dtwfiltered.csv', names=column_names, skiprows=1)
sns.lineplot(data=expert_data, x=expert_data['time (ms)'], y=expert_data['pressure (kPa)']).set_title('Expert L Bend #1')


# In[ ]:





# In[67]:


# expert_data["dt"] = 
expert_data["dt"] = expert_data["time (ms)"].diff()
expert_data["dP"] = expert_data["pressure (kPa)"].diff()
rohdata["dt"] = rohdata["time (ms)"].diff()
rohdata["dP"] = rohdata["pressure (kPa)"].diff()

# expert_data
plt.figure(figsize=(12, 6))#size of the data plot
sns.lineplot(data=expert_data, x=expert_data['time (ms)'], y=expert_data['dP']).set_title('dP: Expert L Bend #1')
plt.xticks(np.arange(expert_data['time (ms)'].min(), expert_data['time (ms)'].max(), 1000.0))
plt.figure(figsize=(12, 6))#size of the data plot
sns.lineplot(data=expert_data, x=expert_data['time (ms)'], y=expert_data['pressure (kPa)']).set_title('dP: Expert L Bend #1')
plt.xticks(np.arange(expert_data['time (ms)'].min(), expert_data['time (ms)'].max(), 1000.0))
plt.figure(figsize=(12, 6))#size of the data plot

sns.lineplot(data=rohdata, x=rohdata['time (ms)'], y=rohdata['dP']).set_title('dP: Rohita L Bend #1')
plt.xticks(np.arange(rohdata['time (ms)'].min(), rohdata['time (ms)'].max(), 1000.0))
plt.figure(figsize=(12, 6))#size of the data plot
sns.lineplot(data=rohdata, x=rohdata['time (ms)'], y=rohdata['pressure (kPa)']).set_title('dP: Rohita L Bend #1')
plt.xticks(np.arange(rohdata['time (ms)'].min(), rohdata['time (ms)'].max(), 1000.0))



# ### Feature extraction

# In[105]:


import pandas as pd
import os
from scipy.signal import find_peaks
def get_features(filepath):
    #basepath = '/content/drive/MyDrive/The Hybrid Atelier/REU2024/1 - Project Folders/Rohita & Roy/2 - Data Collection/Collab Data Visualization/'

    if not os.path.isfile(filepath):
        print(f"{filepath} not working.")

    # reads all the data into the data frame along with all the varaiables
    column_names = [
        "time (ms)","pressure (kPa)"
    ]
    data = pd.read_csv(filepath, names=column_names, skiprows=1)#skip row just skips the labels
    features = {
        'min_Pa': -1,
        'max_Pa': -1,
        'num_peaks': -1,
        'blow_duration': -1,
        'mean_pa': -1
    }
    features['blow_duration'] = data["time (ms)"].max()
    features['min_Pa'] = data['pressure (kPa)'].min()
    features['max_Pa'] = data['pressure (kPa)'].max()
    features['mean_pa'] = data['pressure (kPa)'].mean()
    peaks, _ = find_peaks(data['pressure (kPa)'].to_numpy(), threshold=100)
    print(peaks)
    
    #print(data)
    #will basically equalize the time
    #data["time (ms)"] = data["time (ms)"] - data["time (ms)"].iloc[0]
    return features

filepaths_expert = ['bend1dtwfiltered.csv', 'bend2dtwfiltered.csv', 'bend3dtwfiltered.csv']
novicepaths = ['RohL_bend1dtwfiltered.csv', 'RohL_rbend2dtwfiltered.csv']
expert_min = []
expert_max = []
expert_mean = []
expert_duration = []
novice_min = []
novice_max = []
novice_mean = []
novice_duration = []
for filepath in filepaths_expert:
    feat = get_features(filepath)
    #feat = pd.DataFrame(feat.items(), columns=list(feat.keys))
    expert_min.append(feat['min_Pa'])
    expert_max.append(feat['max_Pa'])
    expert_mean.append(feat['mean_pa'])
    expert_duration.append(feat['blow_duration'])
for filepath in novicepaths:
    feat = get_features(filepath)
    novice_min.append(feat['min_Pa'])
    novice_max.append(feat['max_Pa'])
    novice_mean.append(feat['mean_pa'])
    novice_duration.append(feat['blow_duration'])
novice_stats = []
novice_stats.append(np.mean(novice_min))
novice_stats.append( np.mean(novice_max))
novice_stats.append( np.mean(novice_mean))
novice_stats.append(np.mean(novice_duration))
expert_stats = []
expert_stats.append(np.mean(expert_min))
expert_stats.append(np.mean(expert_max))
expert_stats.append(np.mean(expert_mean))
expert_stats.append(np.mean(expert_duration))
print(expert_stats)
print(novice_stats)



# ### DTW analysis

# In[27]:


import pandas as pd
import os
from dtw import *

def load_data(filepath):
    #basepath = '/content/drive/MyDrive/The Hybrid Atelier/REU2024/1 - Project Folders/Rohita & Roy/2 - Data Collection/Collab Data Visualization/'

    if not os.path.isfile(filepath):
        print(f"{filepath} not working.")

    # reads all the data into the data frame along with all the varaiables
    column_names = [
        "time (ms)","pressure (kPa)"
    ]
    data = pd.read_csv(filepath, names=column_names, skiprows=1)#skip row just skips the labels
    #print(data)
    #will basically equalize the time
    #data["time (ms)"] = data["time (ms)"] - data["time (ms)"].iloc[0]
    return data["pressure (kPa)"].to_numpy()



# bend2 = load_data('bend2.csv')
# bend3 = load_data('bend3.csv')
# roh_bend = load_data('RohL_bend1.csv')
bends = []
filepaths = ['RohL_bend1dtwfiltered.csv', 'RohL_rbend2dtwfiltered.csv', 'bend1dtwfiltered.csv', 'bend2dtwfiltered.csv', 'bend3dtwfiltered.csv']
for filepath in filepaths:
    bends.append(load_data(filepath))
    #print(bends)

offsetamount = 5000
dtws = []
count = 1
for i in range(len(filepaths)):
    count = 0
    for j in bends[i+1:]:
        alignment = dtw(bends[i], j, keep_internals=True)
        print(filepaths[i], end=" ")
        print(filepaths[i+1:][count], end=": ")
        print(alignment.normalizedDistance)
        dtwPlotTwoWay(d=alignment, offset=offsetamount)
        dtws.append(dtw(bends[i], j, keep_internals=True))
        count+=1
        
# alignment = dtw(bends[0], bends[2], keep_internals=True)
# print(alignment.normalizedDistance)

#sns.lineplot()
# print(alignment3.normalizedDistance)
# alignment.plot(type="twoway")
# alignment2 = dtw(roh_bend, bend3, keep_internals=True, 
#     step_pattern=rabinerJuangStepPattern(6, "c"))
# alignment2.plot(type="twoway",offset=-2)
# print(alignment2.normalizedDistance)


## A noisy sine wave as query
# idx = np.linspace(0,6.28,num=100)
# #print(idx)
# query = np.sin(idx) + np.random.uniform(size=100)/10.0
# #print(query)

# ## A cosine is for template; sin and cos are offset by 25 samples
# template = np.cos(idx)
#print(template)


# In[62]:


import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import os

def read_and_plot(filepaths):
    #basepath = '/content/drive/MyDrive/The Hybrid Atelier/REU2024/1 - Project Folders/Rohita & Roy/2 - Data Collection/Collab Data Visualization/'
    plt.figure(figsize=(12, 6))#size of the data plot

    for filepath in filepaths:
        #filepath = basepath + filepath
        if not os.path.isfile(filepath):
            print(f"{filepath} not working.")
            continue

        # reads all the data into the data frame along with all the varaiables
        column_names = [
            "Time", "Acc_X", "Acc_Y", "Acc_Z","Gyr_X", "Gyr_Y", "Gyr_Z",
            "Mag_X", "Mag_Y", "Mag_Z","Temp", "Pa", "PSI", "atm"
        ]
        data = pd.read_csv(filepath, names=column_names, skiprows=1)#skip row just skips the labels

        #will basically equalize the time
        data["Time"] = data["Time"] - data["Time"].iloc[0]

        # will plot all the points
        # plt.plot(data["Time"], data["Pa"], label=os.path.basename(filepath))
        plt.figure("3 Bends")
        sns.lineplot(data=data, x=data["Time"], y=data["Pa"]).set(xlim=(0, None))
        plt.legend(['bend1', 'bend2', 'bend3'])
        plt.show()
    # plt.xlabel('Time')
    # plt.ylabel('pressure (kPa)')
    # plt.title('Pressure over Time')
    # plt.legend()
    # plt.grid(True)
    # plt.show()

if __name__ == "__main__":
    #filepaths = ["bt1.csv", "bt2.csv", "bt3.csv"]
    filepaths = ["bend3.csv", "bend2.csv", "bend1.csv"] #all the files i want in the graph
    read_and_plot(filepaths)

