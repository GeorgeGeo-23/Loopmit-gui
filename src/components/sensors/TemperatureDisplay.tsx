// src/components/sensors/TemperatureDisplay.tsx
'use client';

import React from 'react';
import { useESP } from '../../context/ESPContext';
import { Thermometer, AlertTriangle } from 'lucide-react';

interface TempCardProps {
  label: string;
  value: number;
  criticalTemp?: number;
}

function TempCard({ label, value, criticalTemp = 120 }: TempCardProps) {
  const isCritical = value > criticalTemp;
  const isWarning = value > criticalTemp * 0.8;

  return (
    <div
      className={`rounded-lg shadow-md p-6 transition-colors ${
        isCritical
          ? 'bg-red-50 border-2 border-red-500'
          : isWarning
          ? 'bg-yellow-50 border-2 border-yellow-500'
          : 'bg-white border-2 border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            {isCritical && <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />}
          </div>
          <p
            className={`text-3xl font-bold mt-2 ${
              isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-900'
            }`}
          >
            {value.toFixed(1)}°C
          </p>
          {isWarning && (
            <p className="text-xs text-gray-500 mt-1">
              {isCritical ? 'CRITICAL!' : `Warning: ${((value / criticalTemp) * 100).toFixed(0)}%`}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
        >
          <Thermometer className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function TemperatureDisplay() {
  const { temperatureData } = useESP();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Temperature Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TempCard label="Motor Temperature" value={temperatureData.motor} />
        <TempCard label="Object Temperature" value={temperatureData.object} />
        <TempCard label="Ambient Temperature" value={temperatureData.ambient} criticalTemp={50} />
        <TempCard label="Battery Temperature" value={temperatureData.battery} />
      </div>
    </div>
  );
}