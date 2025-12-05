'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  ESPData,
  VoltageData,
  TemperatureData,
  AccelerationData,
  SpeedData,
  CalibrationData,
  RelayState,
  RelayCommand,
  RelayKey,
  RelayNumber,
} from '../types/esp.types';
import { SerialPort } from 'serialport/dist/serialport';

interface OrientationData {
  x: number;
  y: number;
  z: number;
}

interface ESPContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;

  // WebSocket specific
  sendMessage?: (message: string) => void;

  // Serial specific
  connectToSerial: () => Promise<void>;
  disconnectSerial: () => Promise<void>;

  // Voltage data
  voltageData: VoltageData;
  voltage: number;

  // Temperature data
  temperatureData: TemperatureData;
  objectTemp: number;

  // Acceleration data
  accelerationData: AccelerationData;
  acceleration: AccelerationData;

  // Speed data
  speedData: SpeedData;

  // Orientation data
  orientation: OrientationData;

  // Calibration data
  calibration: CalibrationData;

  // Gap height (LiDAR)
  gapHeight: number;

  // Raw data
  rawData: ESPData | null;

  // Relay control
  relayState: RelayState;
  relayStates: RelayState;
  sendRelayCommand: (relay: RelayCommand) => void;
  toggleRelay: (relayNum: RelayNumber) => Promise<void>;
  turnAllOn: () => Promise<void>;
  turnAllOff: () => Promise<void>;
  activateEmergencyBrake: () => void;

  // History
  dataHistory: ESPData[];
  clearHistory: () => void;
}

const ESPContext = createContext<ESPContextType | undefined>(undefined);

export function ESPProvider({ children }: { children: ReactNode }) {
  // Connection state
  const [isSerialConnected, setIsSerialConnected] = useState(false);
  const [isSerialConnecting, setIsSerialConnecting] = useState(false);
  const [port, setPort] = useState<SerialPort | null>(null);
  const [reader, setReader] = useState<ReadableStreamDefaultReader | null>(null);
  const [writer, setWriter] = useState<WritableStreamDefaultWriter | null>(null);
  const [serialError, setSerialError] = useState<string>('');

  // Voltage data
  const [voltageData, setVoltageData] = useState<VoltageData>({
    inverter: 0,
    lvs: 0,
    contacter: 0,
  });
  const [voltage, setVoltage] = useState<number>(0);

  // Temperature data
  const [temperatureData, setTemperatureData] = useState<TemperatureData>({
    motor: 0,
    object: 0,
    ambient: 0,
    battery: 0,
  });
  const [objectTemp, setObjectTemp] = useState<number>(0);

  // Acceleration data
  const [accelerationData, setAccelerationData] = useState<AccelerationData>({
    x: 0,
    y: 0,
    z: 0,
    magnitude: 0,
  });
  const [acceleration, setAcceleration] = useState<AccelerationData>({
    x: 0,
    y: 0,
    z: 0,
    magnitude: 0,
  });

  // Speed data
  const [speedData, setSpeedData] = useState<SpeedData>({
    value: 0,
    unit: 'm/s',
  });

  // Orientation data
  const [orientation, setOrientation] = useState<OrientationData>({
    x: 0,
    y: 0,
    z: 0,
  });

  // Calibration data
  const [calibration, setCalibration] = useState<CalibrationData>({
    gyro: 0,
    sys: 0,
    magneto: 0,
  });

  // Gap height
  const [gapHeight, setGapHeight] = useState<number>(0);

  // Relay states
  const [relayState, setRelayState] = useState<RelayState>({
    A: false,
    B: false,
    C: false,
    D: false,
  });

  const [rawData, setRawData] = useState<ESPData | null>(null);
  const [dataHistory, setDataHistory] = useState<ESPData[]>([]);

  // WebSocket message handler
  const handleMessage = useCallback((data: ESPData) => {
    setRawData(data);

    // Add to history (keep last 100 entries)
    setDataHistory((prev) => {
      const newHistory = [...prev, data];
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
      setTemperatureData({
        motor: data.dsTemperature ?? 0,
        object: data.objectTemp ?? 0,
        ambient: data.ambientTemp ?? 0,
        battery: data.mlxTemperature ?? 0,
      });
    }

    // Update acceleration data
    if (data.accel && Array.isArray(data.accel) && data.accel.length >= 3) {
      const [x, y, z] = data.accel;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      setAccelerationData({ x, y, z, magnitude });

      // Calculate speed from acceleration
      const speed = Math.abs(magnitude - 9.8); // Remove gravity
      setSpeedData({
        value: speed,
        unit: 'm/s',
      });
    }
  }, []);

  // Serial data processor
  const processData = useCallback((data: ESPData) => {
    setRawData(data);

    // Add to history
    setDataHistory((prev) => {
      const newHistory = [...prev, { ...data, timestamp: new Date().toISOString() }];
      return newHistory.slice(-100);
    });

    // Update gap height (LiDAR)
    if (data.gap_height !== undefined) {
      setGapHeight(data.gap_height);
    }

    // Update object temperature
    if (data.objectTemp !== undefined) {
      setObjectTemp(data.objectTemp);
    }

    // Update orientation from BNO055
    if (data.orientation && Array.isArray(data.orientation) && data.orientation.length >= 3) {
      setOrientation({
        x: data.orientation[0],
        y: data.orientation[1],
        z: data.orientation[2],
      });
    }

    // Update acceleration from DFRobot_ICG
    if (data.accel && Array.isArray(data.accel) && data.accel.length >= 3) {
      const [x, y, z] = data.accel;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      setAcceleration({ x, y, z, magnitude });
    }

    // Update calibration data from BNO055
    if (data.calibration && Array.isArray(data.calibration) && data.calibration.length >= 3) {
      setCalibration({
        gyro: data.calibration[0],
        sys: data.calibration[1],
        magneto: data.calibration[2],
      });
    }

    // Update voltage
    if (data.voltage !== undefined) {
      setVoltage(data.voltage);
    }

    // Update relay states
    if (data.relayStates) {
      setRelayState((prev) => ({
        ...prev,
        ...data.relayStates,
      }));
    }
  }, []);

  const { isConnected, isConnecting, error, sendMessage, connect, disconnect } =
    useWebSocket(handleMessage);

  // Serial connection methods
  const connectToSerial = async () => {
    try {
      if (!('serial' in navigator)) {
        setSerialError('Web Serial API not supported');
        return;
      }

      setIsSerialConnecting(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectedPort = await (navigator as any).serial.requestPort();
      await selectedPort.open({ baudRate: 115200 });

      const textDecoder = new TextDecoderStream();
      selectedPort.readable.pipeTo(textDecoder.writable);
      const newReader = textDecoder.readable.getReader();

      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(selectedPort.writable);
      const newWriter = textEncoder.writable.getWriter();

      setPort(selectedPort);
      setReader(newReader);
      setWriter(newWriter);
      setIsSerialConnected(true);
      setIsSerialConnecting(false);
      setSerialError('');

      await sendCommand('STATUS');
    } catch (err) {
      setSerialError(`Connection failed: ${err}`);
      setIsSerialConnecting(false);
      console.error('Serial connection error:', err);
    }
  };

  const disconnectSerial = async () => {
    try {
      if (reader) {
        await reader.cancel();
        setReader(null);
      }
      if (writer) {
        await writer.close();
        setWriter(null);
      }
      if (port) {
        await port.close();
        setPort(null);
      }
      setIsSerialConnected(false);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const sendCommand = async (command: string) => {
    if (!writer) {
      setSerialError('Not connected');
      return;
    }

    try {
      await writer.write(command + '\n');
      console.log('Sent command:', command);
    } catch (err) {
      setSerialError(`Failed to send: ${err}`);
      console.error('Send error:', err);
    }
  };

  // WebSocket relay command
  const sendRelayCommand = useCallback(
    (relay: RelayCommand) => {
      sendMessage(`${relay}\n`);

      // Update local relay state
      const relayKey = relay.toUpperCase() as RelayKey;
      const isOn = relay === relay.toUpperCase();

      setRelayState((prev) => ({
        ...prev,
        [relayKey]: isOn,
      }));
    },
    [sendMessage]
  );

  // Serial relay toggle (RelayNumber is alias for RelayKey: 'A' | 'B' | 'C' | 'D')
  const toggleRelay = async (relayNum: RelayNumber) => {
    const newState = !relayState[relayNum];
    const command = `RELAY${relayNum}_${newState ? 'ON' : 'OFF'}`;

    await sendCommand(command);

    setRelayState((prev) => ({
      ...prev,
      [relayNum]: newState,
    }));
  };

  const turnAllOn = async () => {
    await sendCommand('ALL_ON');
    setRelayState({
      A: true,
      B: true,
      C: true,
      D: true,
    });
  };

  const turnAllOff = async () => {
    await sendCommand('ALL_OFF');
    setRelayState({
      A: false,
      B: false,
      C: false,
      D: false,
    });
  };

  const activateEmergencyBrake = useCallback(() => {
    sendMessage('EMERGENCY_BRAKE\n');
    console.log('Emergency brake activated');
  }, [sendMessage]);

  const clearHistory = useCallback(() => {
    setDataHistory([]);
  }, []);

  // Listen for incoming serial data
  useEffect(() => {
    if (!reader) return;

    let buffer = '';

    const readLoop = async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += value;

          // Process complete JSON objects
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.substring(0, newlineIndex).trim();
            buffer = buffer.substring(newlineIndex + 1);

            if (line.startsWith('{')) {
              try {
                const data: ESPData = JSON.parse(line);
                processData(data);
              } catch (err) {
                console.error('JSON parse error:', err);
              }
            } else if (line.includes('STATE:')) {
              const stateStr = line.split('STATE:')[1].trim();
              const states = stateStr.split(',');
              if (states.length === 4) {
                setRelayState({
                  A: states[0] === '1',
                  B: states[1] === '1',
                  C: states[2] === '1',
                  D: states[3] === '1',
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Read error:', err);
      }
    };

    readLoop();
  }, [reader, processData]);

  const value: ESPContextType = {
    isConnected: isConnected || isSerialConnected,
    isConnecting: isConnecting || isSerialConnecting,
    error: error || serialError,
    connect,
    disconnect,
    sendMessage,
    connectToSerial,
    disconnectSerial,
    voltageData,
    voltage,
    temperatureData,
    objectTemp,
    accelerationData,
    acceleration,
    speedData,
    orientation,
    calibration,
    gapHeight,
    rawData,
    relayState,
    relayStates: relayState,
    sendRelayCommand,
    toggleRelay,
    turnAllOn,
    turnAllOff,
    activateEmergencyBrake,
    dataHistory,
    clearHistory,
  };

  return <ESPContext.Provider value={value}>{children}</ESPContext.Provider>;
}

export function useESP() {
  const context = useContext(ESPContext);
  if (context === undefined) {
    throw new Error('useESP must be used within an ESPProvider');
  }
  return context;
}