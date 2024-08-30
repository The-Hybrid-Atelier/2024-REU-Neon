import pandas as pd
import matplotlib.pyplot as plt

# Load the CSV file
df = pd.read_csv('../data/p1/l-bend/t1/air.csv')

# Display the first few rows of the dataframe
print(df.head())

# Summary statistics
print(df.describe())

# Plot the data to inspect visually
plt.plot(df['Time'], df['Pa'])
plt.xlabel('Time (s)')
plt.ylabel('Pressure (Pa)')
plt.title('Time vs Pressure')
plt.show()
