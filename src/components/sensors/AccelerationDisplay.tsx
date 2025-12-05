// src/components/sensors/AccelerationDisplay.tsx
'use client';

import React from 'react';
import { useESP } from '../../context/ESPContext';
import { Activity, Gauge } from 'lucide-react';

export function AccelerationDisplay() {
  const { accelerationData } = useESP();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">Acceleration</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">X-Axis:</span>
            <span className="text-lg font-bold text-gray-900">{accelerationData.x.toFixed(2)} m/s²</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(Math.abs(accelerationData.x) * 10, 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Y-Axis:</span>
            <span className="text-lg font-bold text-gray-900">{accelerationData.y.toFixed(2)} m/s²</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(Math.abs(accelerationData.y) * 10, 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Z-Axis:</span>
            <span className="text-lg font-bold text-gray-900">{accelerationData.z.toFixed(2)} m/s²</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(Math.abs(accelerationData.z) * 10, 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Magnitude:</span>
            <span className="text-lg font-bold text-orange-600">
              {accelerationData.magnitude.toFixed(2)} m/s²
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(Math.abs(accelerationData.magnitude) * 10, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SpeedDisplay() {
  const { speedData } = useESP();

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="w-6 h-6" />
        <h3 className="text-xl font-bold">Current Speed</h3>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-6xl font-bold">{speedData.value.toFixed(2)}</span>
        <span className="text-2xl font-semibold mb-2">{speedData.unit}</span>
      </div>

      <div className="mt-4 w-full bg-white/20 rounded-full h-3">
        <div
          className="bg-white h-3 rounded-full transition-all shadow-lg"
          style={{ width: `${Math.min(speedData.value * 5, 100)}%` }}
        />
      </div>
    </div>
  );
}