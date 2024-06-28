from flask import Flask, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO
import os

app = Flask(__name__)
CORS(app)

FONT_SCALE = 1.5
LINE_WIDTH = 2.5

def read_and_plot(filepaths):
    plt.figure(figsize=(12, 6))
    sns.set(style="whitegrid", font_scale=FONT_SCALE)

    for filepath in filepaths:
        if not os.path.isfile(filepath):
            print(f"{filepath} not found.")
            continue

        column_names = [
            "Time", "Acc_X", "Acc_Y", "Acc_Z", "Gyr_X", "Gyr_Y", "Gyr_Z",
            "Mag_X", "Mag_Y", "Mag_Z", "Temp", "Pa", "PSI", "atm"
        ]
        data = pd.read_csv(filepath, names=column_names, skiprows=1)

        data["Time"] = (data["Time"] - data["Time"].iloc[0]) / 1000.0

        data["Pa"] = data["Pa"] / 1000.0

        sns.lineplot(x="Time", y="Pa", data=data, linewidth=LINE_WIDTH)

    plt.xlabel('Time (s)')
    plt.ylabel('Pressure (kPa)')
    plt.title('Pressure over Time L Bend')
    plt.tight_layout()

    img = BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    return img

# Random Data For Testing
def generate_and_plot_data():
    plt.figure(figsize=(12, 6))
    sns.set(style="whitegrid")

    # Generate random data
    time = np.linspace(0, 10, 100)  # Simulated time from 0 to 10 seconds
    pressure = np.random.normal(loc=101.3, scale=5, size=100)  # Simulated pressure data

    data = pd.DataFrame({
        'Time': time,
        'Pressure': pressure
    })

    sns.lineplot(x='Time', y='Pressure', data=data, linewidth=2.5)

    plt.xlabel('Time (s)')
    plt.ylabel('Pressure (kPa)')
    plt.title('Simulated Pressure over Time')
    plt.tight_layout()

    img = BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    return img

@app.route('/plot_test')
def plot_test():
    img = generate_and_plot_data()
    return send_file(img, mimetype='image/png')

@app.route('/')
def hello_world():
    return jsonify({"message": "Connected"})  # Return JSON

@app.route('/plot')
def plot_data(): #/workspaces/2024-REU-Neon/sensor-captions-app/app/fbend1EX.csv
    filepaths = ["/workspaces/2024-REU-Neon/sensor-captions-app/app/fbend1EX.csv"]
    img = read_and_plot(filepaths)
    return send_file(img, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
