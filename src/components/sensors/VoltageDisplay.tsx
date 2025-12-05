// src/components/sensors/VoltageDisplay.tsx
'use client';

import React from 'react';
import { useESP } from '../../context/ESPContext';
import { Zap } from 'lucide-react';

interface VoltageCardProps {
  label: string;
  value: number;
  color?: string;
}

function VoltageCard({ label, value, color = 'blue' }: VoltageCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toFixed(2)}V</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses] || 'bg-blue-500'}`}>
          <Zap className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function VoltageDisplay() {
  const { voltageData } = useESP();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Voltage Readings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VoltageCard label="Inverter Voltage" value={voltageData.inverter} color="#3b82f6" />
        <VoltageCard label="LVS Voltage" value={voltageData.lvs} color="#10b981" />
        <VoltageCard label="Contacter Voltage" value={voltageData.contacter} color="#8b5cf6" />
      </div>
    </div>
  );
}