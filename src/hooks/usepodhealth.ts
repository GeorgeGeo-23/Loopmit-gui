// src/hooks/usePodHealth.ts
'use client';

import { useMemo } from 'react';
import { VoltageData, TemperatureData, AccelerationData, ESPData } from '../types/esp.types';

export interface HealthMetric {
  name: string;
  status: 'excellent' | 'good' | 'warning' | 'critical' | 'offline';
  value: number; // 0-100
  weight: number; // Importance weight
  message?: string;
}

export interface PodHealthResult {
  overallHealth: number;
  overallStatus: 'excellent' | 'good' | 'warning' | 'critical' | 'offline';
  metrics: HealthMetric[];
  criticalIssues: string[];
  warnings: string[];
}

interface UsePodHealthParams {
  isConnected: boolean;
  voltageData: VoltageData;
  temperatureData: TemperatureData;
  accelerationData: AccelerationData;
  rawData: ESPData | null;
}

// Health thresholds
const THRESHOLDS = {
  temperature: {
    critical: 120,
    warning: 100,
    caution: 80,
    normal: 60,
  },
  voltage: {
    lvs: { nominal: 12, min: 10, max: 14 },
    inverter: { nominal: 48, min: 40, max: 54 },
    contacter: { nominal: 24, min: 20, max: 28 },
  },
  dataAge: {
    excellent: 1000,
    good: 3000,
    warning: 5000,
    critical: 10000,
  },
};

export function usePodHealth({
  isConnected,
  voltageData,
  temperatureData,
  accelerationData,
  rawData,
}: UsePodHealthParams): PodHealthResult {
  return useMemo(() => {
    const metrics: HealthMetric[] = [];
    const criticalIssues: string[] = [];
    const warnings: string[] = [];

    // 1. Connection Health (Weight: 25%)
    const connectionHealth: HealthMetric = {
      name: 'Connection',
      status: isConnected ? 'excellent' : 'offline',
      value: isConnected ? 100 : 0,
      weight: 25,
      message: isConnected ? 'WebSocket connected' : 'Not connected to ESP32',
    };
    metrics.push(connectionHealth);
    if (!isConnected) {
      criticalIssues.push('WebSocket connection lost');
    }

    // 2. Power System Health (Weight: 25%)
    const calculateVoltageHealth = (
      actual: number,
      nominal: number,
      min: number,
      max: number
    ): number => {
      if (actual === 0) return 0;
      if (actual < min || actual > max) return 25;
      const deviation = Math.abs(actual - nominal) / nominal;
      return Math.max(0, 100 - deviation * 100);
    };

    const lvsHealth = calculateVoltageHealth(
      voltageData.lvs,
      THRESHOLDS.voltage.lvs.nominal,
      THRESHOLDS.voltage.lvs.min,
      THRESHOLDS.voltage.lvs.max
    );
    const inverterHealth = calculateVoltageHealth(
      voltageData.inverter,
      THRESHOLDS.voltage.inverter.nominal,
      THRESHOLDS.voltage.inverter.min,
      THRESHOLDS.voltage.inverter.max
    );
    const contacterHealth = calculateVoltageHealth(
      voltageData.contacter,
      THRESHOLDS.voltage.contacter.nominal,
      THRESHOLDS.voltage.contacter.min,
      THRESHOLDS.voltage.contacter.max
    );

    const avgVoltageHealth = (lvsHealth + inverterHealth + contacterHealth) / 3;

    const powerHealth: HealthMetric = {
      name: 'Power System',
      status:
        avgVoltageHealth > 80
          ? 'excellent'
          : avgVoltageHealth > 60
          ? 'good'
          : avgVoltageHealth > 40
          ? 'warning'
          : avgVoltageHealth > 0
          ? 'critical'
          : 'offline',
      value: avgVoltageHealth,
      weight: 25,
      message: `LVS: ${voltageData.lvs.toFixed(1)}V, Inverter: ${voltageData.inverter.toFixed(1)}V, Contacter: ${voltageData.contacter.toFixed(1)}V`,
    };
    metrics.push(powerHealth);

    if (avgVoltageHealth === 0) {
      criticalIssues.push('No voltage readings from power system');
    } else if (avgVoltageHealth < 40) {
      criticalIssues.push('Power system voltage critically low');
    } else if (avgVoltageHealth < 60) {
      warnings.push('Power system voltage below optimal range');
    }

    // 3. Thermal System Health (Weight: 30%)
    const maxTemp = Math.max(
      temperatureData.motor,
      temperatureData.object,
      temperatureData.battery,
      temperatureData.ambient
    );

    let tempHealth = 0;
    let tempStatus: HealthMetric['status'] = 'offline';

    if (maxTemp === 0) {
      tempHealth = 0;
      tempStatus = 'offline';
      criticalIssues.push('No temperature readings available');
    } else if (maxTemp > THRESHOLDS.temperature.critical) {
      tempHealth = 0;
      tempStatus = 'critical';
      criticalIssues.push(`CRITICAL: Temperature at ${maxTemp.toFixed(1)}°C - Emergency shutdown required!`);
    } else if (maxTemp > THRESHOLDS.temperature.warning) {
      tempHealth = 25;
      tempStatus = 'critical';
      criticalIssues.push(`Temperature dangerously high: ${maxTemp.toFixed(1)}°C`);
    } else if (maxTemp > THRESHOLDS.temperature.caution) {
      tempHealth = 50;
      tempStatus = 'warning';
      warnings.push(`Temperature elevated: ${maxTemp.toFixed(1)}°C`);
    } else if (maxTemp > THRESHOLDS.temperature.normal) {
      tempHealth = 75;
      tempStatus = 'good';
    } else {
      tempHealth = 100;
      tempStatus = 'excellent';
    }

    const thermalHealth: HealthMetric = {
      name: 'Thermal System',
      status: tempStatus,
      value: tempHealth,
      weight: 30,
      message: `Motor: ${temperatureData.motor.toFixed(1)}°C, Battery: ${temperatureData.battery.toFixed(1)}°C, Max: ${maxTemp.toFixed(1)}°C`,
    };
    metrics.push(thermalHealth);

    // 4. Motion Sensors Health (Weight: 10%)
    const accelMagnitude = accelerationData.magnitude;
    const sensorHealth = accelMagnitude > 0 ? 100 : 0;

    const motionHealth: HealthMetric = {
      name: 'Motion Sensors',
      status: sensorHealth > 0 ? 'excellent' : 'offline',
      value: sensorHealth,
      weight: 10,
      message:
        sensorHealth > 0
          ? `IMU operational (${accelMagnitude.toFixed(2)} m/s²)`
          : 'No IMU data received',
    };
    metrics.push(motionHealth);

    if (sensorHealth === 0) {
      warnings.push('Motion sensors not responding');
    }

    // 5. Data Stream Health (Weight: 10%)
    const dataAge = rawData?.timestamp
      ? new Date().getTime() - new Date(rawData.timestamp).getTime()
      : Infinity;

    let streamHealth = 0;
    let streamStatus: HealthMetric['status'] = 'offline';

    if (dataAge < THRESHOLDS.dataAge.excellent) {
      streamHealth = 100;
      streamStatus = 'excellent';
    } else if (dataAge < THRESHOLDS.dataAge.good) {
      streamHealth = 75;
      streamStatus = 'good';
    } else if (dataAge < THRESHOLDS.dataAge.warning) {
      streamHealth = 50;
      streamStatus = 'warning';
      warnings.push('Data stream experiencing delays');
    } else if (dataAge < THRESHOLDS.dataAge.critical) {
      streamHealth = 25;
      streamStatus = 'critical';
      warnings.push('Data stream critically delayed');
    } else {
      streamHealth = 0;
      streamStatus = 'offline';
      criticalIssues.push('No recent data received');
    }

    const dataStreamHealth: HealthMetric = {
      name: 'Data Stream',
      status: streamStatus,
      value: streamHealth,
      weight: 10,
      message:
        dataAge < 60000
          ? `Last update: ${(dataAge / 1000).toFixed(1)}s ago`
          : 'No recent data',
    };
    metrics.push(dataStreamHealth);

    // Calculate weighted overall health
    const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = metrics.reduce((sum, m) => sum + m.value * m.weight, 0);
    const overallHealth = Math.round(weightedSum / totalWeight);

    // Determine overall status
    let overallStatus: PodHealthResult['overallStatus'];
    if (overallHealth >= 80) {
      overallStatus = 'excellent';
    } else if (overallHealth >= 60) {
      overallStatus = 'good';
    } else if (overallHealth >= 40) {
      overallStatus = 'warning';
    } else if (overallHealth > 0) {
      overallStatus = 'critical';
    } else {
      overallStatus = 'offline';
    }

    return {
      overallHealth,
      overallStatus,
      metrics,
      criticalIssues,
      warnings,
    };
  }, [isConnected, voltageData, temperatureData, accelerationData, rawData]);
}