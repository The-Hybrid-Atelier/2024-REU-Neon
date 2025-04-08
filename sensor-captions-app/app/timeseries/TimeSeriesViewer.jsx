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

const verticalLinePlugin = {
    id: 'verticalLinePlugin',
    afterDraw: (chart) => {
        if (!chart || !chart.chartArea) return;

        const { ctx, chartArea: { left, right, top, bottom }, scales: { x } } = chart;

        const time = chart.config.options.plugins.verticalLine?.timePosition;
        if (!time || !x) return;

        // Find pixel position for the given timePosition
        const xPos = x.getPixelForValue(time);
        if (xPos >= left && xPos <= right) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(xPos, top);
            ctx.lineTo(xPos, bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';  // You can customize the color
            ctx.stroke();
            ctx.restore();
        }
    }
};

ChartJS.register(verticalLinePlugin);


const TimeSeriesViewer = ({ selectedVideo, timePosition, onGraphClick, width = '100%', height = '100%' }) => {
    const containerRef = useRef(null); // Initialize containerRef
    const [chartData, setChartData] = useState({
        datasets: [
            {
                label: 'Pressure (kPa)',
                data: [],
                borderColor: 'steelblue',
                backgroundColor: 'rgba(70, 130, 180, 0.2)', // lighter area under the line
                borderWidth: 5,  // Increase the width of the line
                fill: true,
                pointRadius: 0,  // Remove the data point markers
                tension: 0.4, // or any value between 0 (sharp) and 1 (smooth)
            },
        ],

    });

    useEffect(() => {
        if (selectedVideo?.airdata) {
            const timeArray = selectedVideo.airdata.t;
            const pressureArray = selectedVideo.airdata.kPa || selectedVideo.airdata.data; // fallback

            const dataPoints = timeArray.map((t, i) => ({
                x: t,
                y: pressureArray[i]
            }));

            setChartData({
                datasets: [
                  {
                    label: 'Pressure (kPa)',
                    data: dataPoints,
                    parsing: false,
                    borderColor: 'steelblue',
                    backgroundColor: 'rgba(70, 130, 180, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    tension: 0.4, // <-- replaces cubicInterpolationMode
                  }
                ],
              });
              

            console.log("t:", timeArray);
        }
}, [selectedVideo?.airdata]);


    const options = {
        responsive: true,
        // maintainAspectRatio: false,
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
        plugins: {
            verticalLine: {
                timePosition: timePosition,
            },
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
                type: 'linear',
                title: {
                  display: true,
                  text: 'Time (s)',
                },
                min: Math.min(...(selectedVideo?.airdata?.t || [])),
                max: Math.max(...(selectedVideo?.airdata?.t || [])),
                ticks: {
                  maxTicksLimit: 10,
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
            }
        },

        onClick: (event, elements) => {
            if (elements.length && onGraphClick) {
                const elementIndex = elements[0].index;
                const point = chartData.datasets[0].data[elementIndex];
                if (point?.x !== undefined) {
                    onGraphClick(point.x);
                }
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
                          parsing: false,
                          borderWidth: calculateBorderWidth(containerRef.current?.clientWidth || 600),
                          fill: true,
                          backgroundColor: 'rgba(70, 130, 180, 0.2)',
                          tension: 0.4,
                        }
                      ]
                }}
                options={options}
                height={height} // Make sure height is used properly
                className='bg-white px-3 rounded w-full'
            />
        </div>
    );
};

export default TimeSeriesViewer;
