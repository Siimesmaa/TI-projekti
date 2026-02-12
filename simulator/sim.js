const http = require('http');

const SERVER_URL = process.env.SERVER_URL || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || 3000;
const SEND_INTERVAL = 1000; // 1 second

// Simulation state
let goodCount = 0;
let rejectCount = 0;
let cycleTime = 2500; // Base cycle time in ms
let temperature = 65; // Base temperature in °C
let machineState = 'RUN';
let faultCountdown = Math.floor(Math.random() * 20) + 30; // Random time until next fault

console.log('======================================');
console.log('Telemetry Simulator Starting');
console.log('======================================');
console.log(`Target: http://${SERVER_URL}:${SERVER_PORT}/api/telemetry`);
console.log(`Interval: ${SEND_INTERVAL}ms`);
console.log('======================================\n');

function generateTelemetry() {
  // Update state based on current machine state
  switch (machineState) {
    case 'RUN':
      // Normal operation with some variation
      temperature = 65 + Math.random() * 10 - 5; // 60-70°C
      cycleTime = 2500 + Math.random() * 500 - 250; // 2250-2750ms
      
      // Occasionally produce a good or reject part
      if (Math.random() > 0.3) {
        if (Math.random() > 0.05) { // 95% good rate
          goodCount++;
        } else {
          rejectCount++;
        }
      }
      
      // Countdown to fault
      faultCountdown--;
      if (faultCountdown <= 0) {
        machineState = 'FAULT';
        console.log('⚠️  FAULT condition triggered!');
      }
      break;
      
    case 'IDLE':
      // Idle state - temperature slowly decreases
      temperature = Math.max(20, temperature - 0.5);
      cycleTime = 0;
      
      // Random chance to resume
      if (Math.random() > 0.7) {
        machineState = 'RUN';
        console.log('✓ Machine resumed from IDLE');
      }
      break;
      
    case 'FAULT':
      // Fault state - temperature spikes
      temperature = 80 + Math.random() * 15; // 80-95°C
      cycleTime = 0;
      
      // Fault lasts 5-15 seconds
      setTimeout(() => {
        machineState = 'IDLE';
        faultCountdown = Math.floor(Math.random() * 20) + 30; // Reset countdown
        console.log('⚙️  Machine entering IDLE after FAULT');
      }, (5 + Math.random() * 10) * 1000);
      break;
  }

  return {
    timestamp: new Date().toISOString(),
    machineState,
    temperature: Math.round(temperature * 10) / 10, // Round to 1 decimal
    cycleTimeMs: Math.round(cycleTime),
    goodCount,
    rejectCount
  };
}

function sendTelemetry(data) {
  const postData = JSON.stringify(data);
  
  const options = {
    hostname: SERVER_URL,
    port: SERVER_PORT,
    path: '/api/telemetry',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 201) {
        const stateIcon = {
          'RUN': '🟢',
          'IDLE': '🟡',
          'FAULT': '🔴'
        }[data.machineState] || '⚪';
        
        console.log(`${stateIcon} [${new Date().toLocaleTimeString()}] ${data.machineState.padEnd(5)} | ` +
                    `Temp: ${data.temperature.toFixed(1)}°C | ` +
                    `Cycle: ${data.cycleTimeMs}ms | ` +
                    `Good: ${data.goodCount} | Reject: ${data.rejectCount}`);
      } else {
        console.error(`❌ Error: Server responded with status ${res.statusCode}`);
        console.error(`   Response: ${responseData}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Failed to send telemetry: ${error.message}`);
    console.error(`   Make sure the server is running at http://${SERVER_URL}:${SERVER_PORT}`);
  });

  req.write(postData);
  req.end();
}

// Check if server is available before starting
function checkServerHealth() {
  const options = {
    hostname: SERVER_URL,
    port: SERVER_PORT,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✓ Server is available\n');
      startSimulation();
    } else {
      console.error('❌ Server returned unexpected status:', res.statusCode);
      console.error('   Please start the server first with: npm run server');
      process.exit(1);
    }
  });

  req.on('error', (error) => {
    console.error('❌ Cannot connect to server');
    console.error(`   Make sure the server is running: npm run server`);
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  });

  req.end();
}

function startSimulation() {
  console.log('Starting telemetry generation...\n');
  
  // Send initial telemetry immediately
  const telemetry = generateTelemetry();
  sendTelemetry(telemetry);
  
  // Then send every interval
  setInterval(() => {
    const telemetry = generateTelemetry();
    sendTelemetry(telemetry);
  }, SEND_INTERVAL);
}

// Start the simulator after checking server
checkServerHealth();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n======================================');
  console.log('Simulator stopped');
  console.log(`Final counts - Good: ${goodCount}, Reject: ${rejectCount}`);
  console.log('======================================');
  process.exit(0);
});
