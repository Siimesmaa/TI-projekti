const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors()); // Enable CORS for all origins (allows webapp from different host)
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory storage for telemetry data
const telemetryData = [];
const MAX_HISTORY = 1000; // Store last 1000 data points

// POST /api/telemetry - Receive telemetry data
app.post('/api/telemetry', (req, res) => {
  try {
    const { timestamp, machineState, temperature, cycleTimeMs, goodCount, rejectCount } = req.body;
    
    // Basic validation
    if (!timestamp || !machineState || temperature === undefined || 
        cycleTimeMs === undefined || goodCount === undefined || rejectCount === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['timestamp', 'machineState', 'temperature', 'cycleTimeMs', 'goodCount', 'rejectCount']
      });
    }

    // Validate machineState
    const validStates = ['RUN', 'IDLE', 'FAULT'];
    if (!validStates.includes(machineState)) {
      return res.status(400).json({ 
        error: 'Invalid machineState',
        validStates 
      });
    }

    // Validate numeric fields
    if (typeof temperature !== 'number' || typeof cycleTimeMs !== 'number' ||
        typeof goodCount !== 'number' || typeof rejectCount !== 'number') {
      return res.status(400).json({ 
        error: 'Numeric fields must be numbers'
      });
    }

    const telemetry = {
      timestamp,
      machineState,
      temperature,
      cycleTimeMs,
      goodCount,
      rejectCount,
      receivedAt: new Date().toISOString()
    };

    // Add to storage and maintain max size
    telemetryData.push(telemetry);
    if (telemetryData.length > MAX_HISTORY) {
      telemetryData.shift();
    }

    res.status(201).json({ 
      success: true,
      message: 'Telemetry data received',
      dataPointsStored: telemetryData.length
    });
  } catch (error) {
    console.error('Error processing telemetry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/telemetry/latest - Get latest telemetry sample
app.get('/api/telemetry/latest', (req, res) => {
  if (telemetryData.length === 0) {
    return res.status(404).json({ error: 'No telemetry data available' });
  }

  res.json(telemetryData[telemetryData.length - 1]);
});

// GET /api/telemetry/history - Get recent telemetry samples
app.get('/api/telemetry/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, MAX_HISTORY);
  
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ error: 'Invalid limit parameter' });
  }

  const startIndex = Math.max(0, telemetryData.length - limit);
  const history = telemetryData.slice(startIndex);

  res.json({
    count: history.length,
    total: telemetryData.length,
    data: history
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    dataPoints: telemetryData.length,
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`======================================`);
  console.log(`Industrial Internet Telemetry Server`);
  console.log(`======================================`);
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Dashboard: http://${HOST}:${PORT}/`);
  console.log(`API endpoints:`);
  console.log(`  POST   /api/telemetry`);
  console.log(`  GET    /api/telemetry/latest`);
  console.log(`  GET    /api/telemetry/history?limit=N`);
  console.log(`  GET    /api/health`);
  console.log(`======================================`);
  console.log(`Network configuration:`);
  console.log(`  To access from other devices on network:`);
  console.log(`  1. Find your server's IP address`);
  console.log(`  2. Open http://<server-ip>:${PORT}/ on client device`);
  console.log(`  3. Configure simulator with SERVER_URL=<server-ip>`);
  console.log(`======================================`);
});
