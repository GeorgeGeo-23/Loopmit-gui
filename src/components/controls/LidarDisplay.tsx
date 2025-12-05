'use client';

import React from 'react';
import { Radar } from 'lucide-react';
import { useESP } from '../../context/ESPContext';

// Simple lidar status widget that surfaces the raw telemetry reported by the pod.
const LidarDisplay: React.FC = () => {
  const { rawData, isConnected } = useESP();
  const distance = rawData?.lidarDistance ?? null;
  const quality = rawData?.lidarQuality ?? null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center gap-2">
        <Radar className="h-6 w-6 text-indigo-600" />
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Lidar Module</p>
          <p className="text-xl font-semibold text-gray-900">
            {isConnected ? 'Streaming' : 'Waiting for link'}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 bg-indigo-50 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-indigo-800">Distance</p>
          <p className="mt-2 text-3xl font-bold text-indigo-900">
            {distance !== null ? `${distance.toFixed(2)} m` : '--'}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-indigo-50 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-indigo-800">Quality</p>
          <p className="mt-2 text-3xl font-bold text-indigo-900">
            {quality !== null ? quality.toFixed(0) : '--'}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Last frame:{' '}
        {rawData?.timestamp ? new Date(rawData.timestamp).toLocaleTimeString() : 'No data yet'}
      </p>
    </div>
  );
};

export default LidarDisplay;