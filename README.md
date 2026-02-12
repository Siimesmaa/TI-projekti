# Industrial Internet Mini-Project

A complete Industrial Internet telemetry monitoring system built with Node.js. This project demonstrates real-time machine telemetry collection, storage, and visualization through a web dashboard.

## 🎯 Overview

This mini-project consists of three main components:

1. **Telemetry Simulator** - Generates realistic machine telemetry data every second
2. **Backend API Server** - Node.js Express server that receives and stores telemetry data
3. **Web Dashboard** - Real-time visualization dashboard with charts and latest values

## ✨ Features

- **Real-time telemetry monitoring** with 1-second updates
- **Machine state tracking**: RUN, IDLE, and FAULT states
- **Temperature trend visualization** using vanilla JavaScript canvas
- **Production metrics**: Good count, reject count, quality rate, cycle time
- **RESTful API** for telemetry ingestion and retrieval
- **In-memory data storage** with rolling history (last 1000 points)
- **Auto-refresh dashboard** with connection status indicator
- **Realistic simulation** with random faults and fluctuations

## 📋 Prerequisites

- **Node.js** (LTS version recommended - v18.x or v20.x)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version` and `npm --version`
- **Windows, macOS, or Linux** compatible

## 🚀 Quick Start (Windows)

### 1. Install Dependencies

Open Command Prompt or PowerShell in the project directory:

```cmd
npm install
```

### 2. Start the Backend Server

In the first terminal window:

```cmd
npm run server
```

You should see:
```
======================================
Industrial Internet Telemetry Server
======================================
Server running on http://localhost:3000
Dashboard: http://localhost:3000/
...
======================================
```

### 3. Start the Simulator

Open a **second** terminal window in the same directory:

```cmd
npm run sim
```

You should see telemetry data being sent:
```
======================================
Telemetry Simulator Starting
======================================
...
🟢 [time] RUN   | Temp: 65.3°C | Cycle: 2450ms | Good: 5 | Reject: 0
```

### 4. View the Dashboard

Open your web browser and navigate to:

```
http://localhost:3000/
```

You'll see:
- Latest telemetry values in colorful cards
- Temperature trend chart
- Recent history table
- Real-time updates every second

## 📁 Project Structure

```
TI-projekti/
├── server/
│   └── index.js          # Express backend server
├── simulator/
│   └── sim.js            # Telemetry simulator
├── public/
│   ├── index.html        # Dashboard HTML
│   ├── app.js            # Dashboard JavaScript
│   └── style.css         # Dashboard styling
├── package.json          # Node.js dependencies and scripts
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🔌 API Endpoints

### POST /api/telemetry
Ingest telemetry data from the simulator.

**Request Body:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "machineState": "RUN",
  "temperature": 65.5,
  "cycleTimeMs": 2500,
  "goodCount": 100,
  "rejectCount": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Telemetry data received",
  "dataPointsStored": 150
}
```

### GET /api/telemetry/latest
Get the most recent telemetry sample.

**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "machineState": "RUN",
  "temperature": 65.5,
  "cycleTimeMs": 2500,
  "goodCount": 100,
  "rejectCount": 5,
  "receivedAt": "2024-01-15T10:30:00.100Z"
}
```

### GET /api/telemetry/history?limit=N
Get recent telemetry samples (default: 100, max based on storage).

**Response:**
```json
{
  "count": 50,
  "total": 150,
  "data": [ /* array of telemetry objects */ ]
}
```

### GET /api/health
Check server health and status.

**Response:**
```json
{
  "status": "ok",
  "dataPoints": 150,
  "uptime": 3600.5
}
```

## 🎮 Usage

### Running Components Separately

**Backend Server:**
```cmd
npm run server
```
or
```cmd
node server/index.js
```

**Simulator:**
```cmd
npm run sim
```
or
```cmd
node simulator/sim.js
```

### Stopping the Application

Press `Ctrl+C` in each terminal window to stop the server and simulator.

## 📊 Dashboard Features

### Latest Telemetry Cards
- **Machine State**: Current operating state (RUN/IDLE/FAULT) with color coding
  - 🟢 Green = RUN
  - 🟡 Yellow = IDLE
  - 🔴 Red = FAULT
- **Temperature**: Current machine temperature in °C
- **Cycle Time**: Current production cycle time in milliseconds
- **Good Count**: Total number of good parts produced
- **Reject Count**: Total number of rejected parts
- **Quality Rate**: Percentage of good parts (calculated)

### Temperature Trend Chart
- Line chart showing temperature over time
- Updates automatically every second
- Shows last 60 data points
- Auto-scaling Y-axis based on temperature range

### Recent History Table
- Last 10 telemetry samples in reverse chronological order
- State badges with color coding
- Timestamps in local time format

### Connection Status
- Green indicator when connected
- Updates in real-time
- Shows error state if server is unavailable

## ⚙️ Configuration

### Network Configuration (Simulator on Server, Webapp on PC)

You can run the simulator on a server and access the dashboard from another device on the network.

#### Option 1: Using the Built-in Web Dashboard

**On the Server:**

1. **Start the server** (it will listen on all network interfaces by default):
   ```cmd
   npm run server
   ```

2. **Find your server's IP address**:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Linux/Mac: `ip addr` or `ifconfig`
   - Example: `192.168.1.100`

3. **Start the simulator** (it will connect to localhost by default):
   ```cmd
   npm run sim
   ```

**On the Client PC:**

1. Open a web browser
2. Navigate to: `http://<server-ip>:3000/`
   - Example: `http://192.168.1.100:3000/`
3. The dashboard will automatically connect to the server and display real-time data

#### Option 2: Using the Standalone Remote Client

If you want to access the dashboard without installing Node.js on the client PC:

**On the Server:**
1. Start the server as described above

**On the Client PC:**
1. Copy the `public` folder to your client PC
2. Open `public/remote.html` in a web browser
3. Enter the server URL (e.g., `http://192.168.1.100:3000`)
4. Click "Connect"
5. The dashboard will connect and display real-time data

#### Option 3: Simulator on Remote Server

To run the simulator on a different machine than the server:

**On the Simulator Machine:**

Set the `SERVER_URL` environment variable to point to your server's IP:

```cmd
# Windows
set SERVER_URL=192.168.1.100
set SERVER_PORT=3000
npm run sim
```

```bash
# Linux/Mac
export SERVER_URL=192.168.1.100
export SERVER_PORT=3000
npm run sim
```

Or edit `simulator/sim.js` directly:
```javascript
const SERVER_URL = process.env.SERVER_URL || '192.168.1.100';
const SERVER_PORT = process.env.SERVER_PORT || 3000;
```

### Environment Variables

Create a `.env` file (see `.env.example`) to configure:

```env
# Server Configuration
PORT=3000              # Server port
HOST=0.0.0.0          # Bind to all interfaces (allows remote connections)

# Simulator Configuration  
SERVER_URL=localhost   # Server IP or hostname
SERVER_PORT=3000      # Server port
```

**Note**: This project doesn't include dotenv package, so environment variables must be set manually or the files must be edited directly.

### Change Server Port

Edit `server/index.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

Or set environment variable:
```cmd
set PORT=8080
npm run server
```

### Change Update Interval

Edit `simulator/sim.js`:
```javascript
const SEND_INTERVAL = 1000; // milliseconds
```

Edit `public/app.js`:
```javascript
this.updateInterval = 1000; // milliseconds
```

### Adjust History Size

Edit `server/index.js`:
```javascript
const MAX_HISTORY = 1000; // number of data points
```

## 🧪 Testing

### Manual Testing

1. **Test server startup**: Run `npm run server` and verify it starts without errors
2. **Test API endpoints**: 
   - Visit http://localhost:3000/api/health in browser
   - Should return JSON with status "ok"
3. **Test simulator**: Run `npm run sim` and verify telemetry is sent
4. **Test dashboard**: Open http://localhost:3000/ and verify data updates

### Test Fault Conditions

The simulator automatically generates FAULT states periodically. Watch for:
- 🔴 Red FAULT state in simulator output
- Temperature spikes to 80-95°C
- Machine state changes: RUN → FAULT → IDLE → RUN

## 🐛 Troubleshooting

### "Cannot find module 'express'"
Run `npm install` to install dependencies.

### "Port 3000 already in use"
Another application is using port 3000. Either:
- Stop the other application
- Change the port in `server/index.js`

### Simulator shows "Cannot connect to server"
Make sure the backend server is running first (`npm run server`) before starting the simulator.

### Dashboard not updating
1. Check browser console (F12) for errors
2. Verify server is running
3. Verify simulator is sending data
4. Check network tab in browser dev tools

### Windows Firewall Blocking
If prompted by Windows Firewall, allow Node.js to communicate on private networks.

## 📝 Development

### Adding New Telemetry Fields

1. Update simulator (`simulator/sim.js`) to generate new field
2. Update server validation (`server/index.js`) to accept new field
3. Update dashboard (`public/app.js` and `public/index.html`) to display new field

### Customizing Machine Behavior

Edit `simulator/sim.js` in the `generateTelemetry()` function to adjust:
- Temperature ranges
- Cycle time variation
- Fault frequency
- Quality rate (good vs. reject ratio)

## 🔒 Security Notes

- This is a demo project for local development and educational purposes
- No authentication or authorization implemented
- CORS is enabled for all origins (`*`) for ease of use - restrict to specific origins for production
- Not intended for production use without additional security measures
- Input validation is basic
- When exposing the server on a network, ensure proper firewall rules are in place

## 📚 Technologies Used

- **Node.js** - JavaScript runtime
- **Express** - Web framework for Node.js
- **Vanilla JavaScript** - Frontend logic (no frameworks)
- **HTML5 Canvas** - Chart rendering
- **CSS3** - Styling and responsive design

## 📄 License

ISC

## 👥 Contributing

This is a mini-project for educational purposes. Feel free to fork and modify for your own learning.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify Node.js and npm are properly installed
3. Ensure all files are in the correct directory structure
4. Check that port 3000 is not blocked by firewall

---

**Enjoy monitoring your virtual industrial machine! 🏭**
