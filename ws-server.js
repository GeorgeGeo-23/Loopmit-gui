/**
 * Telemetry bridge WebSocket server.
 * ----------------------------------
 * Listens to a real ESP32 over serial, parses newline-delimited JSON payloads,
 * and broadcasts each reading to every connected WebSocket client.
 *
 * Usage:
 *   SERIAL_PORT=/dev/ttyUSB0 SERIAL_BAUD=115200 node ws-server.js
 *
 * Environment variables:
 *   - WS_PORT (default 8080)         → WebSocket server port
 *   - SERIAL_PORT (default auto)     → Serial device path
 *   - SERIAL_BAUD (default 115200)   → Baud rate for ESP32
 *   - SERIAL_RECONNECT_MS (default 3000) → Delay before retrying serial connect
 */

// Using CommonJS so we can invoke the file directly with `node`.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { WebSocketServer } = require("ws");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SerialPort } = require("serialport");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ReadlineParser } = require("@serialport/parser-readline");

const PORT = Number(process.env.WS_PORT ?? 8080);
const SERIAL_PORT = process.env.SERIAL_PORT ?? null;
const SERIAL_BAUD = Number(process.env.SERIAL_BAUD ?? 115200);
const SERIAL_RECONNECT_MS = Number(process.env.SERIAL_RECONNECT_MS ?? 3_000);

const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

let latestPayload = null;
let serial;
let parser;

const broadcast = (payload) => {
  const data = JSON.stringify(payload);
  clients.forEach((socket) => {
    if (socket.readyState === 1) {
      socket.send(data);
    } else {
      clients.delete(socket);
    }
  });
};

const handleSerialLine = (line) => {
  const trimmed = line.trim();
  if (!trimmed) {
    return;
  }

  try {
    const parsed = JSON.parse(trimmed);
    latestPayload = {
      ...parsed,
      timestamp: parsed.timestamp ?? new Date().toISOString(),
    };
    broadcast(latestPayload);
  } catch (error) {
    console.error("[Serial] Failed to parse payload:", error, "Raw:", trimmed);
  }
};

const disposeSerial = () => {
  if (parser) {
    parser.removeAllListeners();
    parser = null;
  }
  if (serial) {
    serial.removeAllListeners();
    if (serial.isOpen) {
      serial.close();
    }
    serial = null;
  }
};

const connectSerial = async () => {
  disposeSerial();

  const portPath = SERIAL_PORT ?? (await SerialPort.list()).find(Boolean)?.path;
  if (!portPath) {
    console.warn(
      "[Serial] No serial device path configured or detected. Set SERIAL_PORT env var.",
    );
    setTimeout(connectSerial, SERIAL_RECONNECT_MS);
    return;
  }

  console.log(`[Serial] Connecting to ${portPath} @ ${SERIAL_BAUD} baud`);

  serial = new SerialPort({
    path: portPath,
    baudRate: SERIAL_BAUD,
  });

  parser = serial.pipe(new ReadlineParser({ delimiter: "\n" }));
  parser.on("data", handleSerialLine);

  serial.on("open", () => {
    console.log("[Serial] Connection established");
  });

  serial.on("error", (error) => {
    console.error("[Serial] Error:", error.message);
  });

  serial.on("close", () => {
    console.warn("[Serial] Connection closed. Retrying...");
    setTimeout(connectSerial, SERIAL_RECONNECT_MS);
  });
};

connectSerial().catch((error) => {
  console.error("[Serial] Initial connection failed:", error);
});

wss.on("connection", (socket, request) => {
  console.log(`Client connected from ${request.socket.remoteAddress ?? "unknown"}`);
  clients.add(socket);

  if (latestPayload) {
    socket.send(JSON.stringify(latestPayload));
  }

  socket.on("close", () => {
    clients.delete(socket);
    console.log("Client disconnected");
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

wss.on("listening", () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});

wss.on("error", (error) => {
  console.error("WebSocket server error:", error);
});


