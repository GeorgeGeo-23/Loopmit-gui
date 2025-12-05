// src/components/status/PodHealth.tsx
'use client';

import React, { useMemo } from 'react';
import { useESP } from '../../context/ESPContext';
import { Activity, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface HealthMetric {
  name: string;
  status: 'excellent' | 'good' | 'warning' | 'critical' | 'offline';
  value: number; // 0-100
  message?: string;
}

export default function PodHealth() {
  const { 
    isConnected, 
    voltageData, 
    temperatureData, 
    accelerationData,
    rawData 
  } = useESP();

  // Calculate individual health metrics
  const healthMetrics = useMemo((): HealthMetric[] => {
    const metrics: HealthMetric[] = [];

    // Connection Health
    metrics.push({
      name: 'Connection',
      status: isConnected ? 'excellent' : 'offline',
      value: isConnected ? 100 : 0,
      message: isConnected ? 'WebSocket connected' : 'Not connected',
    });

    // Voltage Health (LVS should be ~12V, Inverter ~48V, Contacter ~24V)
    const lvsHealth = voltageData.lvs > 0 
      ? Math.min(100, (voltageData.lvs / 12) * 100) 
      : 0;
    const inverterHealth = voltageData.inverter > 0 
      ? Math.min(100, (voltageData.inverter / 48) * 100) 
      : 0;
    const contacterHealth = voltageData.contacter > 0 
      ? Math.min(100, (voltageData.contacter / 24) * 100) 
      : 0;
    
    const avgVoltageHealth = (lvsHealth + inverterHealth + contacterHealth) / 3;
    
    metrics.push({
      name: 'Power System',
      status: avgVoltageHealth > 80 ? 'excellent' 
            : avgVoltageHealth > 60 ? 'good' 
            : avgVoltageHealth > 40 ? 'warning' 
            : avgVoltageHealth > 0 ? 'critical' 
            : 'offline',
      value: avgVoltageHealth,
      message: `Avg voltage: ${avgVoltageHealth.toFixed(0)}%`,
    });

    // Temperature Health (Lower is better, critical at 120°C)
    const maxTemp = Math.max(
      temperatureData.motor,
      temperatureData.object,
      temperatureData.battery
    );
    
    let tempHealth = 100;
    if (maxTemp > 120) {
      tempHealth = 0; // Critical
    } else if (maxTemp > 100) {
      tempHealth = 25; // Very hot
    } else if (maxTemp > 80) {
      tempHealth = 50; // Hot
    } else if (maxTemp > 60) {
      tempHealth = 75; // Warm
    } else if (maxTemp > 0) {
      tempHealth = 100; // Normal
    } else {
      tempHealth = 0; // No reading
    }

    metrics.push({
      name: 'Thermal',
      status: tempHealth > 80 ? 'excellent' 
            : tempHealth > 60 ? 'good' 
            : tempHealth > 40 ? 'warning' 
            : tempHealth > 0 ? 'critical' 
            : 'offline',
      value: tempHealth,
      message: `Max temp: ${maxTemp.toFixed(1)}°C`,
    });

    // Acceleration/Motion Health (Check if IMU is working)
    const accelMagnitude = accelerationData.magnitude;
    const accelHealth = accelMagnitude > 0 ? 100 : 0;
    
    metrics.push({
      name: 'Motion Sensor',
      status: accelHealth > 0 ? 'excellent' : 'offline',
      value: accelHealth,
      message: accelHealth > 0 ? 'IMU operational' : 'No IMU data',
    });

    // Data Freshness (Check if we're receiving data)
    const dataAge = rawData?.timestamp 
      ? new Date().getTime() - new Date(rawData.timestamp).getTime() 
      : Infinity;
    
    const dataHealth = dataAge < 1000 ? 100 
                     : dataAge < 3000 ? 75 
                     : dataAge < 5000 ? 50 
                     : dataAge < 10000 ? 25 
                     : 0;

    metrics.push({
      name: 'Data Stream',
      status: dataHealth > 80 ? 'excellent' 
            : dataHealth > 60 ? 'good' 
            : dataHealth > 40 ? 'warning' 
            : dataHealth > 0 ? 'critical' 
            : 'offline',
      value: dataHealth,
      message: dataHealth > 0 ? 'Receiving data' : 'No recent data',
    });

    return metrics;
  }, [isConnected, voltageData, temperatureData, accelerationData, rawData]);

  // Calculate overall health
  const overallHealth = useMemo(() => {
    const total = healthMetrics.reduce((sum, metric) => sum + metric.value, 0);
    return Math.round(total / healthMetrics.length);
  }, [healthMetrics]);

  // Get overall status
  const overallStatus = useMemo(() => {
    if (overallHealth >= 80) return 'excellent';
    if (overallHealth >= 60) return 'good';
    if (overallHealth >= 40) return 'warning';
    if (overallHealth > 0) return 'critical';
    return 'offline';
  }, [overallHealth]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-500';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-500';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-500';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-500';
      case 'offline':
        return 'text-gray-600 bg-gray-50 border-gray-500';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'good':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Card */}
      <div className={`rounded-lg shadow-lg p-6 border-4 ${getStatusColor(overallStatus)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Pod Health</h2>
              <p className="text-sm opacity-75">System Status Overview</p>
            </div>
          </div>
          {getStatusIcon(overallStatus)}
        </div>

        {/* Overall Health Percentage */}
        <div className="relative mb-4">
          <div className="flex items-end justify-center">
            <span className="text-6xl font-bold">{overallHealth}</span>
            <span className="text-3xl font-semibold mb-2">%</span>
          </div>
          <p className="text-center text-sm font-medium uppercase tracking-wide mt-2">
            {overallStatus}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getStatusBgColor(overallStatus)}`}
            style={{ width: `${overallHealth}%` }}
          />
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">System Metrics</h3>
        <div className="space-y-4">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="font-semibold text-gray-800">{metric.name}</span>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                  {metric.value.toFixed(0)}%
                </span>
              </div>

              {/* Individual Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getStatusBgColor(metric.status)}`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>

              {metric.message && (
                <p className="text-xs text-gray-600 mt-1">{metric.message}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Health Status Legend */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Status Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Excellent (80-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Good (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Warning (40-59%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Critical (1-39%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-xs text-gray-600">Offline (0%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}