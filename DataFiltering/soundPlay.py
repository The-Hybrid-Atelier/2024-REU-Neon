import numpy as np
import pyaudio
import pandas as pd

def read_pressure_data(file_path):
    df = pd.read_csv(file_path)
    return df['Pa'].tolist()

def map_pressure_to_frequency(pressure, min_pressure, max_pressure, min_freq, max_freq):
    normalized_pressure = (pressure - min_pressure) / (max_pressure - min_pressure)
    frequency = min_freq + normalized_pressure * (max_freq - min_freq)
    return frequency

def generate_sound(pressures, min_pressure, max_pressure, min_freq, max_freq, duration):
    sample_rate = 44100
    t = np.linspace(0, duration / 1000, int(sample_rate * (duration / 1000)), False)
    
    accumulated_wave = np.zeros_like(t)
    
    for pressure in pressures:
        frequency = map_pressure_to_frequency(pressure, min_pressure, max_pressure, min_freq, max_freq)
        wave = np.sin(2 * np.pi * frequency * t)
        accumulated_wave += wave

    modulation_freq = 0.2
    modulation_wave = np.sin(2 * np.pi * modulation_freq * t)
    accumulated_wave *= (1 + 0.5 * modulation_wave)
    
    return accumulated_wave

def play_sound(wave):
    p = pyaudio.PyAudio()
    stream = p.open(format=pyaudio.paFloat32,
                    channels=1,
                    rate=44100,
                    output=True)
    stream.write(wave.astype(np.float32).tobytes())
    stream.stop_stream()
    stream.close()
    p.terminate()

def main():
    file_path = 'fbend1EX.csv'
    pressures = read_pressure_data(file_path)
    min_pressure = min(pressures)
    max_pressure = max(pressures)
    min_freq = 100
    max_freq = 1000
    duration = 100

    sound_wave = generate_sound(pressures, min_pressure, max_pressure, min_freq, max_freq, duration)
    play_sound(sound_wave)

if __name__ == "__main__":
    main()
