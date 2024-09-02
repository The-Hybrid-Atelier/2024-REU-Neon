// API endpoint to read CSV files from the 'data' directory
// Looks for the 'air.csv' file in the specified path
// The air.csv file should have 'Time' and 'Pa' columns
// The 'Pa' column values are converted from Pa to kPa
// A new column 'videoTime' is created with formatted time values (mm:ss)
// The data is returned as an array of time values and kPa values in JSON format
// The JSON data is cached in a corresponding 'air.json' file in the same directory

import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';

export default function handler(req, res) {
    
    const { path: filePathSegments } = req.query; // Captures the entire path
    const filePath = path.join(process.cwd(), 'data', ...filePathSegments, 'air.csv'); // Path to air.csv
    const jsonFilePath = path.join(process.cwd(), 'data', ...filePathSegments, 'air.json'); // Path to air.json (cache)

    const t = [];
    const videoTime = [];
    const kPa = [];

    try {
        // Check if the JSON cache already exists
        if (fs.existsSync(jsonFilePath)) {
            const cachedData = fs.readFileSync(jsonFilePath, 'utf8');
            return res.status(200).json(JSON.parse(cachedData));
        }

        // If JSON cache doesn't exist, read the CSV file
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const timeInSeconds = parseFloat(row['Time'])/1000; // convert ms to s
                const minutes = Math.floor(timeInSeconds / 60);
                const seconds = Math.floor(timeInSeconds % 60);
                const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                t.push(timeInSeconds);
                videoTime.push(formattedTime);
                kPa.push(parseFloat(row['Pa']) / 1000); // Convert Pa to kPa
            })
            .on('end', () => {
                const jsonData = { t, videoTime, kPa };
                fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData)); // Cache the result in air.json
                res.status(200).json(jsonData);
            })
            .on('error', (csvError) => {
                console.error('CSV parsing error:', csvError);
                res.status(500).json({ error: 'Error processing CSV file' });
            });
    } catch (error) {
        console.error('Error reading CSV file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
