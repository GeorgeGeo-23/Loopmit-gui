'use client';

import React from 'react';
import { useESP } from '../../context/ESPContext';
import { RelayNumber } from '../../types/esp.types';

const RelayControlBoard: React.FC = () => {
  const {
    relayStates,
    isConnected,
    isConnecting,
    error,
    connectToSerial,
    disconnectSerial,
    toggleRelay,
    turnAllOn,
    turnAllOff,
  } = useESP();

  const relays: { num: RelayNumber; label: string }[] = [
    { num: 1, label: 'Relay 1' },
    { num: 2, label: 'Relay 2' },
    { num: 3, label: 'Relay 3' },
    { num: 4, label: 'Relay 4' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Connection Status Card */}
      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-4 h-4 rounded-full ${
                isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
              } animate-pulse`}
            ></div>
            <span className="text-lg font-semibold text-gray-800">
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={isConnected ? disconnectSerial : connectToSerial}
            disabled={isConnecting}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              isConnected
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isConnected ? 'Disconnect' : 'Connect to ESP32'}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Relay Controls */}
      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Individual Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relays.map(({ num, label }) => {
            const relayKey = `relay${num}` as keyof typeof relayStates;
            const isOn = relayStates[relayKey];

            return (
              <button
                key={num}
                onClick={() => toggleRelay(num)}
                disabled={!isConnected}
                className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                  isOn
                    ? 'bg-green-500 border-green-600 text-white shadow-lg shadow-green-500/50'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                } ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{isOn ? '💡' : '⚫'}</div>
                  <div className="font-bold text-lg">{label}</div>
                  <div className="text-sm mt-1">{isOn ? 'ON' : 'OFF'}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Master Controls */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Master Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={turnAllOn}
            disabled={!isConnected}
            className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Turn All ON
          </button>
          <button
            onClick={turnAllOff}
            disabled={!isConnected}
            className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Turn All OFF
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelayControlBoard;
