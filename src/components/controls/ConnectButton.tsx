// src/components/controls/ControlButtons.tsx
'use client';

import React, { useState } from 'react';
import { useESP } from '../../context/ESPContext';
import { Wifi, WifiOff, Play, Square, Zap, Rocket, Power, AlertOctagon, OctagonX } from 'lucide-react';

// Connect Button Component
export function ConnectButton() {
  const { isConnected, isConnecting, connect, disconnect } = useESP();

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
        isConnected
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : isConnecting
          ? 'bg-yellow-500 text-white cursor-wait'
          : 'bg-gray-500 hover:bg-gray-600 text-white'
      }`}
    >
      {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
      {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Connect ESP32'}
    </button>
  );
}

// Pod Start Button Component (Relay B)
export function PodStartButton() {
  const { sendRelayCommand, isConnected } = useESP();
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    if (isActive) {
      sendRelayCommand('b'); // OFF
      setIsActive(false);
    } else {
      sendRelayCommand('B'); // ON
      setIsActive(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isConnected}
      className={`flex items-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-green-500 hover:bg-green-600 text-white'
      }`}
    >
      {isActive ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      {isActive ? 'POD STOP' : 'POD START'}
    </button>
  );
}

// LV Start Button Component (Relay A)
export function LVStartButton() {
  const { sendRelayCommand, isConnected } = useESP();
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    if (isActive) {
      sendRelayCommand('a'); // OFF
      setIsActive(false);
    } else {
      sendRelayCommand('A'); // ON
      setIsActive(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isConnected}
      className={`flex items-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-green-500 hover:bg-green-600 text-white'
      }`}
    >
      <Zap className="w-5 h-5" />
      {isActive ? 'LV STOP' : 'LV START'}
    </button>
  );
}

// Launchpad Button Component (Relay C)
export function LaunchpadButton() {
  const { sendRelayCommand, isConnected } = useESP();
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    if (isActive) {
      sendRelayCommand('c'); // OFF
      setIsActive(false);
    } else {
      sendRelayCommand('C'); // ON
      setIsActive(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isConnected}
      className={`flex items-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-green-500 hover:bg-green-600 text-white'
      }`}
    >
      <Rocket className="w-5 h-5" />
      {isActive ? 'Launchpad STOP' : 'Launchpad START'}
    </button>
  );
}

// Inverter Button Component (Relay D)
export function InverterButton() {
  const { sendRelayCommand, isConnected } = useESP();
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    if (isActive) {
      sendRelayCommand('d'); // OFF
      setIsActive(false);
    } else {
      sendRelayCommand('D'); // ON
      setIsActive(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isConnected}
      className={`flex items-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-green-500 hover:bg-green-600 text-white'
      }`}
    >
      <Power className="w-5 h-5" />
      {isActive ? 'Inverter STOP' : 'Inverter START'}
    </button>
  );
}

// Emergency Brake Button Component
export function EmergencyBrakeButton() {
  const { activateEmergencyBrake, isConnected } = useESP();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleClick = () => {
    if (isConfirming) {
      activateEmergencyBrake();
      setIsConfirming(false);
    } else {
      setIsConfirming(true);
      setTimeout(() => setIsConfirming(false), 3000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isConnected}
      className={`flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isConfirming
          ? 'bg-red-700 hover:bg-red-800 text-white animate-pulse'
          : 'bg-red-600 hover:bg-red-700 text-white'
      }`}
    >
      <AlertOctagon className="w-6 h-6" />
      {isConfirming ? 'CLICK TO CONFIRM' : 'EMERGENCY BRAKE'}
    </button>
  );
}

// Pod Stop Button Component - Master Stop
export function PodStopButton() {
  const { sendRelayCommand, isConnected } = useESP();
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    if (isActive) {
      // Deactivate sequence - Resume operation
      sendRelayCommand('D'); // Inverter ON
      sendRelayCommand('A'); // LV ON
      sendRelayCommand('B'); // Pod ON
      sendRelayCommand('c'); // Launchpad OFF
      setIsActive(false);
    } else {
      // Activate sequence - Stop everything
      sendRelayCommand('a'); // LV OFF
      sendRelayCommand('d'); // Inverter OFF
      sendRelayCommand('b'); // Pod OFF
      sendRelayCommand('c'); // Launchpad OFF
      setIsActive(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isConnected}
      className={`flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-orange-600 hover:bg-orange-700 text-white'
          : 'bg-orange-500 hover:bg-orange-600 text-white'
      }`}
    >
      <OctagonX className="w-6 h-6" />
      {isActive ? 'RESUME' : 'POD STOP'}
    </button>
  );
}