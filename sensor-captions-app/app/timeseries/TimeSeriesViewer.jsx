'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Container } from 'semantic-ui-react';
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

const TimeSeriesViewer = ({ selectedVideo, timePosition, onGraphClick, width = '100%', height = '100%' }) => {
    const containerRef = useRef(null); // Initialize containerRef
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Pressure (kPa)',
                data: [],
                borderColor: 'steelblue',
                borderWidth: 5,  // Increase the width of the line
                fill: false,
                pointRadius: 0,  // Remove the data point markers
                cubicInterpolationMode: 'monotone',  // Enable data smoothing
            },
        ],

    });

    useEffect(() => {
        if (selectedVideo?.airdata) {
            console.log('Selected Video:', selectedVideo);
            setChartData({
                labels: selectedVideo.airdata.labels,
                datasets: [
                    {
                        label: 'Pressure (kPa)',
                        data: selectedVideo.airdata.data,
                        borderColor: 'steelblue',
                        borderWidth: 2,
                        fill: false,
                        display: true
                    },
                    {
                        label: 'Time (ms)',
                        data: selectedVideo.airdata.t,
                        display: false, // Add display: false to hide the dataset
                    }
                ],
            });
        }
    }, [selectedVideo.airdata]);

    const options = {
        responsive: true,
        // maintainAspectRatio: false,
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
                    // maxRotation: 45,
                    // minRotation: 45,
                    maxTicksLimit: 5,  // Reduce to 5 labels on the x-axis
                },
            },
            y: {
                beginAtZero: false,
                ticks: {
                    maxTicksLimit: 5,  // Reduce to 5 labels on the y-axis
                },
                title: {
                    display: true,
                    text: 'Pressure (kPa)',  // Label for the y-axis
                },
            },
            xAxes: [{
                type: 'linear',
                display: true,
                scaleLabel: {
                    display: true,
                },
                ticks: {
                    autoSkip: false,  // Disable autoskip to show all labels
                },
            }],
        },

        onClick: (event, elements) => {
            if (elements.length && onGraphClick) {
                const elementIndex = elements[0].index;
                const time = chartData.labels[elementIndex];
                const sec = chartData.datasets[1].data[elementIndex];
                onGraphClick(sec);
            }
        },
    };

    const calculateBorderWidth = (chartWidth) => {
        // Example: Adjust line thickness based on the chart's width
        return Math.max(2, chartWidth / 100/2); // Adjust the divisor as needed
    };


    return (
        <div ref={containerRef} className='w-full'>
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
                height={height} // Make sure height is used properly
                className='bg-white p-3 rounded w-full'
            />
        </div>
    );
};

export default TimeSeriesViewer;
