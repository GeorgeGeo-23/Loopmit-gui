'use client';

import React from 'react';
import { useESP } from '../../context/ESPContext';
import { Settings } from 'lucide-react';

export default function CalibrationDisplay() {
  const { calibration } = useESP();

  const getCalibrationStatus = (value: number) => {
    if (value === 3) return { status: 'FULLY CALIBRATED', color: 'bg-green-500' };
    if (value === 2) return { status: 'GOOD', color: 'bg-blue-500' };
    if (value === 1) return { status: 'PARTIAL', color: 'bg-yellow-500' };
    return { status: 'UNCALIBRATED', color: 'bg-red-500' };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-6 h-6 text-gray-700" />
        <h3 className="text-xl font-bold text-gray-800">BNO055 Calibration Status</h3>
      </div>

      <div className="space-y-4">
        {/* Gyroscope Calibration */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Gyroscope:</span>
            <span className="text-lg font-bold text-gray-900">{calibration.gyro} / 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getCalibrationStatus(calibration.gyro).color}`}
                style={{ width: `${(calibration.gyro / 3) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-32">
              {getCalibrationStatus(calibration.gyro).status}
            </span>
          </div>
        </div>

        {/* System Calibration */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">System:</span>
            <span className="text-lg font-bold text-gray-900">{calibration.sys} / 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getCalibrationStatus(calibration.sys).color}`}
                style={{ width: `${(calibration.sys / 3) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-32">
              {getCalibrationStatus(calibration.sys).status}
            </span>
          </div>
        </div>

        {/* Magnetometer Calibration */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Magnetometer:</span>
            <span className="text-lg font-bold text-gray-900">{calibration.magneto} / 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getCalibrationStatus(calibration.magneto).color}`}
                style={{ width: `${(calibration.magneto / 3) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-32">
              {getCalibrationStatus(calibration.magneto).status}
            </span>
          </div>
        </div>

        {/* Overall Status */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Overall Status:</span>
            {calibration.gyro === 3 && calibration.sys === 3 && calibration.magneto === 3 ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-bold">READY</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-700 font-bold">CALIBRATING...</span>
              </div>
            )}
          </div>
        </div>

        {/* Calibration Tips */}
        {(calibration.gyro < 3 || calibration.sys < 3 || calibration.magneto < 3) && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-xs font-medium">
              💡 Tip: Move the sensor in figure-8 patterns to calibrate the magnetometer. Keep it stable for gyroscope calibration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}