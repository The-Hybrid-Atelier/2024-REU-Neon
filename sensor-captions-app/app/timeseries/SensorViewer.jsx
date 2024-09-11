import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const SensorViewer = ({ sensorData, width = '100%', height = '100%' }) => {
    const containerRef = useRef(null); // Initialize containerRef
    const [chartData, setChartData] = useState({
        labels: [], // Labels for the X-axis
        datasets: [
            {
                label: 'Pressure (kPa)',
                data: [],
                borderColor: 'steelblue',
                borderWidth: 5,  // Line thickness
                fill: false,
                pointRadius: 0,  // Remove data point markers
                cubicInterpolationMode: 'monotone',  // Enable data smoothing
            },
        ],
    });

    useEffect(() => {
        if (sensorData) {
            const newLabels = sensorData.map((_, index) => index); // Generate labels for X-axis
            setChartData({
                labels: newLabels,  // X-axis labels
                datasets: [
                    {
                        label: 'Pressure (kPa)',
                        data: sensorData,
                        borderColor: 'steelblue',
                        borderWidth: 5,
                        fill: false,
                    }
                ],
            });
        }
    }, [sensorData]);

    const options = {
        responsive: true,
        animation: false,  // Disable animations
        maintainAspectRatio: false,  // Let the height/width be responsive
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
        plugins: {
            tooltip: {
                enabled: false,  // Disable tooltips
            },
            legend: {
                display: false,  // Remove legend
            },
            title: {
                display: false,  // Remove title
            },
        },
        scales: {
            x: {
                type: 'category',
                ticks: {
                    display: false,  // Hide X-axis labels
                    maxTicksLimit: 5,  // Limit X-axis ticks (optional if hiding labels)
                },
            },
            y: {
                beginAtZero: false,
                min: 0,  // Set Y-axis minimum value
                max: 1,  // Set Y-axis maximum value
                ticks: {
                    maxTicksLimit: 5,  // Limit Y-axis ticks
                },
                title: {
                    display: true,
                    text: 'Pressure (kPa)',  // Y-axis label
                },
            },
        }
    };

    const calculateBorderWidth = (chartWidth) => {
        return Math.max(2, chartWidth / 100 / 2); // Adjust the divisor as needed
    };

    return (
        <div ref={containerRef} style={{ width, height }} className="w-full">
            <Line
                data={{
                    ...chartData,
                    datasets: [
                        {
                            ...chartData.datasets[0],
                            borderWidth: calculateBorderWidth(containerRef.current?.clientWidth || 600), // Adjust line thickness
                        }
                    ]
                }}
                options={options}
                height={height} // Pass the height correctly
                className="bg-white p-3 rounded w-full"
            />
           
        </div>
    );
};

export default SensorViewer;