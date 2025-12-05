// src/hooks/useRelayControl.ts
'use client';

import { useState, useCallback } from 'react';
import { RelayState, RelayCommand } from '../types/esp.types';

interface UseRelayControlReturn {
  relayState: RelayState;
  toggleRelay: (relay: 'A' | 'B' | 'C' | 'D') => RelayCommand;
  getRelayState: (relay: 'A' | 'B' | 'C' | 'D') => boolean;
  setRelayState: (relay: 'A' | 'B' | 'C' | 'D', state: boolean) => void;
  resetAllRelays: () => RelayCommand[];
  activateEmergencySequence: () => RelayCommand[];
}

export function useRelayControl(
  sendCommand?: (command: RelayCommand) => void
): UseRelayControlReturn {
  const [relayState, setRelayStateInternal] = useState<RelayState>({
    A: false,
    B: false,
    C: false,
    D: false,
  });

  const toggleRelay = useCallback(
    (relay: 'A' | 'B' | 'C' | 'D'): RelayCommand => {
      const currentState = relayState[relay];
      const newState = !currentState;
      const command = (newState ? relay.toUpperCase() : relay.toLowerCase()) as RelayCommand;

      setRelayStateInternal((prev) => ({
        ...prev,
        [relay]: newState,
      }));

      if (sendCommand) {
        sendCommand(command);
      }

      return command;
    },
    [relayState, sendCommand]
  );

  const getRelayState = useCallback(
    (relay: 'A' | 'B' | 'C' | 'D'): boolean => {
      return relayState[relay];
    },
    [relayState]
  );

  const setRelayState = useCallback(
    (relay: 'A' | 'B' | 'C' | 'D', state: boolean) => {
      const command = (state ? relay.toUpperCase() : relay.toLowerCase()) as RelayCommand;

      setRelayStateInternal((prev) => ({
        ...prev,
        [relay]: state,
      }));

      if (sendCommand) {
        sendCommand(command);
      }
    },
    [sendCommand]
  );

  const resetAllRelays = useCallback((): RelayCommand[] => {
    const commands: RelayCommand[] = ['a', 'b', 'c', 'd'];

    setRelayStateInternal({
      A: false,
      B: false,
      C: false,
      D: false,
    });

    if (sendCommand) {
      commands.forEach((cmd) => sendCommand(cmd));
    }

    return commands;
  }, [sendCommand]);

  const activateEmergencySequence = useCallback((): RelayCommand[] => {
    // Emergency sequence: Turn off all relays
    const commands: RelayCommand[] = ['a', 'b', 'c', 'd'];

    setRelayStateInternal({
      A: false,
      B: false,
      C: false,
      D: false,
    });

    if (sendCommand) {
      commands.forEach((cmd) => sendCommand(cmd));
    }

    return commands;
  }, [sendCommand]);

  return {
    relayState,
    toggleRelay,
    getRelayState,
    setRelayState,
    resetAllRelays,
    activateEmergencySequence,
  };
}