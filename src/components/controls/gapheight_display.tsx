'use client';

import React from 'react';
import { useESP } from '../../context/ESPContext';
import { Radar } from 'lucide-react';

export default function GapHeightDisplay() {
  const { gapHeight } = useESP();

  const getHeightColor = (height: number) => {
    if (height < 50) return 'text-red-600';
    if (height < 100) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getHeightStatus = (height: number) => {
    if (height < 50) return 'CRITICAL';
    if (height < 100) return 'WARNING';
    return 'SAFE';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Radar className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-800">Gap Height (VL53L0X LiDAR)</h3>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Current Height</p>
          <p className={`text-6xl font-bold ${getHeightColor(gapHeight)}`}>
            {gapHeight.toFixed(0)}
          </p>
          <p className="text-gray-500 mt-1">mm</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <span className={`text-lg font-bold ${getHeightColor(gapHeight)}`}>
              {getHeightStatus(gapHeight)}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                gapHeight < 50 ? 'bg-red-500' : gapHeight < 100 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((gapHeight / 300) * 100, 100)}%` }}
            />
          </div>
        </div>

        {gapHeight < 50 && (
          <div className="bg-red-100 border border-red-400 rounded-lg p-3">
            <p className="text-red-700 text-sm font-semibold">⚠️ CRITICAL: Gap height too low!</p>
          </div>
        )}

        {gapHeight >= 50 && gapHeight < 100 && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3">
            <p className="text-yellow-700 text-sm font-semibold">⚠️ WARNING: Gap height approaching minimum</p>
          </div>
        )}
      </div>
    </div>
  );
}