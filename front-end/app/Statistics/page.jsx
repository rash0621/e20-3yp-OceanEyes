"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const OceanEyesStats = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  
  // Get current date
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-based index (0 = January, 11 = December)

  // Generate detection data based on current date
  const generateDetectionData = (year) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const baseData = [
      { date: "Jan", count: 0 },
      { date: "Feb", count: 0 },
      { date: "Mar", count: 0 },
      { date: "Apr", count: 0 },
      { date: "May", count: 0 },
      { date: "Jun", count: 2 },
      { date: "Jul", count: 5 },
      { date: "Aug", count: 0 },
      { date: "Sep", count: 0 },
      { date: "Oct", count: 0 },
      { date: "Nov", count: 0 },
      { date: "Dec", count: 0 },
    ];

    if (year === 2025) {
      // For 2025, show data up to the current month
      if (currentYear === 2025) {
        return baseData.slice(0, currentMonth + 1);
      } else {
        // If we're past 2025, show all months for 2025
        return baseData;
      }
    }
    
    // For future years, return empty array
    return [];
  };

  // Sample data for defined years
  const statsData = {
    2025: {
      detectionOverTime: generateDetectionData(2025),
      plasticTypes: [
        { type: "Plastic bags", count: 1 },
        { type: "Plastic", count: 6 },
        { type: "Wood", count: 0 },
        { type: "Beverage can", count: 0 },
      ],
    },
    2026: {
      detectionOverTime: [],
      plasticTypes: [],
    },
    2027: {
      detectionOverTime: [],
      plasticTypes: [],
    },
  };

  // Fallback if year is not in statsData
  const emptyYearData = {
    detectionOverTime: [],
    plasticTypes: [],
  };

  const currentYearData = statsData[selectedYear] || emptyYearData;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <img
        src="/assets/nav/graph.jpg"
        alt="OceanEyes Device"
        className="w-36 mx-auto mb-8"
      />

      {/* Current Date Info */}
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-500">
            Date: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Year Selection */}
      <div className="mb-8 text-center">
        <label className="text-lg font-medium text-gray-700 mr-4">
          Select Year:
        </label>
        <input
          type="number"
          value={selectedYear}
          min="2025"
          max="2100"
          step="1"
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 w-32 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center"
        />
      </div>

      {/* Statistics */}

      <div className="mb-20 text-center">
        <h2 className="text-2xl font-bold mb-6">
          Plastic Detections Over Time ({selectedYear})
        </h2>
        {/* <p className="text-gray-600">
          Environmental monitoring data for the year {selectedYear}
        </p> */}
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentYearData?.detectionOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                label={{
                  value: "Count",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value) => [value, "Detections"]}
                labelFormatter={(label) => `${label} ${selectedYear}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#FF0000"
                strokeWidth={3}
                dot={{ fill: "#FF0000", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">
          Plastic Types Detected ({selectedYear})
        </h2>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentYearData?.plasticTypes || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis
                label={{
                  value: "Count",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value) => [value, "Detections"]}
                labelFormatter={(label) => `${label} - ${selectedYear}`}
              />
              <Legend />
              <Bar
                dataKey="count"
                fill="#82ca9d"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      {/* <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-center">
          Summary for {selectedYear}
        </h3>

        {(() => {
          let summaryTotal = currentYearData?.detectionOverTime?.reduce(
            (sum, item) => sum + item.count,
            0
          );
          let summaryPeak =
            currentYearData?.detectionOverTime?.length > 0
              ? Math.max(...currentYearData.detectionOverTime.map((item) => item.count))
              : 0;
          let summaryTypes = currentYearData?.plasticTypes?.length || 0;

          // If the year is not 2025, force summary to 0
          if (selectedYear !== 2025) {
            summaryTotal = 0;
            summaryPeak = 0;
            summaryTypes = 0;
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white p-4 rounded shadow">
                <div className="text-2xl font-bold text-blue-600">
                  {summaryTotal}
                </div>
                <div className="text-gray-600">Total Detections</div>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <div className="text-2xl font-bold text-green-600">
                  {summaryPeak}
                </div>
                <div className="text-gray-600">Peak Monthly Count</div>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <div className="text-2xl font-bold text-orange-600">
                  {summaryTypes}
                </div>
                <div className="text-gray-600">Types Monitored</div>
              </div>
            </div>
          );
        })()}
      </div> */}
    </div>
  );
};

export default OceanEyesStats;