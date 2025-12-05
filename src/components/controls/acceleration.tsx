'use client';

import React from 'react';
import { useESP } from '../../context/ESPContext';
import { Activity } from 'lucide-react';

export default function AccelerationDisplay() {
  const { acceleration } = useESP();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">Acceleration (DFRobot ICG)</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* X-axis */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">X-Axis:</span>
            <span className="text-lg font-bold text-gray-900">{acceleration.x.toFixed(2)} m/s²</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(Math.abs(acceleration.x) * 10, 100)}%` }}
            />
          </div>
        </div>

        {/* Y-axis */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Y-Axis:</span>
            <span className="text-lg font-bold text-gray-900">{acceleration.y.toFixed(2)} m/s²</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(Math.abs(acceleration.y) * 10, 100)}%` }}
            />
          </div>
        </div>

        {/* Z-axis */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Z-Axis:</span>
            <span className="text-lg font-bold text-gray-900">{acceleration.z.toFixed(2)} m/s²</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(Math.abs(acceleration.z) * 10, 100)}%` }}
            />
          </div>
        </div>

        {/* Magnitude */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Magnitude:</span>
            <span className="text-lg font-bold text-orange-600">
              {acceleration.magnitude.toFixed(2)} m/s²
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(Math.abs(acceleration.magnitude) * 10, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Alert for high acceleration */}
      {acceleration.magnitude > 20 && (
        <div className="mt-4 bg-orange-100 border border-orange-400 rounded-lg p-3">
          <p className="text-orange-700 text-sm font-semibold">⚠️ High acceleration detected!</p>
        </div>
      )}
    </div>
  );
}