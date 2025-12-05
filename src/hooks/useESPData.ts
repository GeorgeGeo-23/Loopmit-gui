/* eslint-disable @typescript-eslint/no-unused-vars */
// src/hooks/useESPData.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { ESPData, VoltageData, TemperatureData, AccelerationData, SpeedData } from '../types/esp.types';

const CRITICAL_TEMP = 120;
const CONNECTION_TIMEOUT = 5000;

interface UseESPDataReturn {
  voltageData: VoltageData;
  temperatureData: TemperatureData;
  accelerationData: AccelerationData;
  speedData: SpeedData;
  processData: (data: ESPData) => void;
  dataHistory: ESPData[];
  clearHistory: () => void;
  isCriticalTemperature: boolean;
}

export function useESPData(): UseESPDataReturn {
  const [voltageData, setVoltageData] = useState<VoltageData>({
    inverter: 0,
    lvs: 0,
    contacter: 0,
  });

  const [temperatureData, setTemperatureData] = useState<TemperatureData>({
    motor: 0,
    object: 0,
    ambient: 0,
    battery: 0,
  });

  const [accelerationData, setAccelerationData] = useState<AccelerationData>({
    x: 0,
    y: 0,
    z: 0,
    magnitude: 0,
  });

  const [speedData, setSpeedData] = useState<SpeedData>({
    value: 0,
    unit: 'm/s',
  });

  const [dataHistory, setDataHistory] = useState<ESPData[]>([]);
  const [isCriticalTemperature, setIsCriticalTemperature] = useState(false);

  const processData = useCallback((data: ESPData) => {
    // Add to history (keep last 100 entries)
    setDataHistory((prev) => {
      const newHistory = [...prev, { ...data, timestamp: new Date().toISOString() }];
      return newHistory.slice(-100);
    });

    // Update voltage data
    if (data.VB1 !== undefined || data.VB2 !== undefined || data.VB3 !== undefined) {
      setVoltageData({
        inverter: data.VB2 ?? 0,
        lvs: data.VB1 ?? 0,
        contacter: data.VB3 ?? 0,
      });
    }

    // Update temperature data
    if (
      data.dsTemperature !== undefined ||
      data.objectTemp !== undefined ||
      data.ambientTemp !== undefined ||
      data.mlxTemperature !== undefined
    ) {
      const newTempData = {
        motor: data.dsTemperature ?? 0,
        object: data.objectTemp ?? 0,
        ambient: data.ambientTemp ?? 0,
        battery: data.mlxTemperature ?? 0,
      };
      
      setTemperatureData(newTempData);

      // Check for critical temperature
      const maxTemp = Math.max(
        newTempData.motor,
        newTempData.object,
        newTempData.battery
      );
      
      setIsCriticalTemperature(maxTemp > CRITICAL_TEMP);
    }

    // Update acceleration data
    if (data.accel && Array.isArray(data.accel) && data.accel.length >= 3) {
      const [x, y, z] = data.accel;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      setAccelerationData({ x, y, z, magnitude });

      // Calculate speed from acceleration (remove gravity component)
      const speed = Math.max(0, Math.abs(magnitude - 9.8));
      setSpeedData({
        value: speed,
        unit: 'm/s',
      });
    }

    // Update orientation if present
    if (data.orientation && Array.isArray(data.orientation)) {
      // Store orientation data if needed
      console.log('Orientation:', data.orientation);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setDataHistory([]);
  }, []);

  return {
    voltageData,
    temperatureData,
    accelerationData,
    speedData,
    processData,
    dataHistory,
    clearHistory,
    isCriticalTemperature,
  };
}