// src/components/status/DetailedHealthView.tsx
'use client';

import React from 'react';
import { useESP } from '../../context/ESPContext';
import { usePodHealth } from '../../hooks/usepodhealth';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function DetailedHealthView() {
  const { 
    isConnected, 
    voltageData, 
    temperatureData, 
    accelerationData,
    rawData 
  } = useESP();

  const { overallHealth, overallStatus, metrics, criticalIssues, warnings } = usePodHealth({
    isConnected,
    voltageData,
    temperatureData,
    accelerationData,
    rawData,
  });

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

  const getTrendIcon = () => {
    if (overallHealth >= 80) {
      return <TrendingUp className="w-6 h-6 text-green-600" />;
    } else if (overallHealth >= 40) {
      return <Activity className="w-6 h-6 text-yellow-600" />;
    } else {
      return <TrendingDown className="w-6 h-6 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-2">Critical Issues</h3>
              <ul className="space-y-1">
                {criticalIssues.map((issue, index) => (
                  <li key={index} className="text-red-700 text-sm">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warnings Alert */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-start">
            <Info className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">Warnings</h3>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-yellow-700 text-sm">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Overall Health Card */}
      <div className={`rounded-lg shadow-lg p-6 border-4 ${getStatusColor(overallStatus)}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-10 h-10" />
            <div>
              <h2 className="text-3xl font-bold">Pod Health Status</h2>
              <p className="text-sm opacity-75 mt-1">Comprehensive System Analysis</p>
            </div>
          </div>
          {getTrendIcon()}
        </div>

        {/* Health Percentage Circle */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* SVG Circle Progress */}
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                className={
                  overallHealth >= 80
                    ? 'text-green-500'
                    : overallHealth >= 60
                    ? 'text-blue-500'
                    : overallHealth >= 40
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }
                strokeDasharray={`${(overallHealth / 100) * 553} 553`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            
            {/* Centered Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold">{overallHealth}</span>
              <span className="text-2xl font-semibold">%</span>
              <span className="text-sm font-medium uppercase tracking-wide mt-2 opacity-75">
                {overallStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getStatusBgColor(overallStatus)}`}
            style={{ width: `${overallHealth}%` }}
          />
        </div>
      </div>

      {/* Individual Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getStatusColor(metric.status).split(' ').pop()}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(metric.status)}
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{metric.name}</h3>
                  <p className="text-xs text-gray-500">Weight: {metric.weight}%</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold ${getStatusColor(metric.status).split(' ')[0]}`}>
                  {metric.value.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Metric Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getStatusBgColor(metric.status)}`}
                style={{ width: `${metric.value}%` }}
              />
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                {metric.status.toUpperCase()}
              </span>
              {metric.message && (
                <p className="text-xs text-gray-600 text-right flex-1 ml-2">{metric.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Health Status Legend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Status Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg border-2 border-green-500">
            <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
            <span className="font-semibold text-green-700">Excellent</span>
            <span className="text-xs text-green-600 mt-1">80-100%</span>
            <p className="text-xs text-gray-600 text-center mt-2">All systems optimal</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-500">
            <CheckCircle2 className="w-8 h-8 text-blue-600 mb-2" />
            <span className="font-semibold text-blue-700">Good</span>
            <span className="text-xs text-blue-600 mt-1">60-79%</span>
            <p className="text-xs text-gray-600 text-center mt-2">Operating normally</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-500">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mb-2" />
            <span className="font-semibold text-yellow-700">Warning</span>
            <span className="text-xs text-yellow-600 mt-1">40-59%</span>
            <p className="text-xs text-gray-600 text-center mt-2">Requires attention</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg border-2 border-red-500">
            <XCircle className="w-8 h-8 text-red-600 mb-2" />
            <span className="font-semibold text-red-700">Critical</span>
            <span className="text-xs text-red-600 mt-1">1-39%</span>
            <p className="text-xs text-gray-600 text-center mt-2">Immediate action needed</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border-2 border-gray-500">
            <XCircle className="w-8 h-8 text-gray-600 mb-2" />
            <span className="font-semibold text-gray-700">Offline</span>
            <span className="text-xs text-gray-600 mt-1">0%</span>
            <p className="text-xs text-gray-600 text-center mt-2">System not responding</p>
          </div>
        </div>
      </div>
    </div>
  );
}