# Network Configuration Guide

This guide explains how to use the Industrial Internet Telemetry system in different network configurations.

## Quick Start - Same Machine (Default)

This is the simplest setup - everything runs on the same computer.

1. **Start the server:**
   ```bash
   npm run server
   ```

2. **Start the simulator:**
   ```bash
   npm run sim
   ```

3. **Open the dashboard:**
   - Browser: http://localhost:3000/

## Scenario 1: Server on One Machine, Dashboard on Another

Perfect for when you want to view the dashboard from multiple devices on your network.

### On the Server Machine:

1. **Start the server:**
   ```bash
   npm run server
   ```
   The server will automatically listen on all network interfaces (0.0.0.0:3000)

2. **Find your server's IP address:**
   - **Windows:** Open Command Prompt and run `ipconfig`
     - Look for "IPv4 Address" under your active network adapter
     - Example: 192.168.1.100
   
   - **Linux/Mac:** Open Terminal and run `ip addr` or `ifconfig`
     - Look for the inet address
     - Example: 192.168.1.100

3. **Start the simulator on the same machine:**
   ```bash
   npm run sim
   ```
   (It will connect to localhost:3000 by default)

### On the Client Machine(s):

**Option A: Using any web browser**
1. Open your web browser
2. Navigate to: `http://<server-ip>:3000/`
   - Replace `<server-ip>` with your server's IP address
   - Example: `http://192.168.1.100:3000/`
3. The dashboard will load and automatically connect to the server

**Option B: Using the standalone remote client**
1. Copy the `public` folder from the server to your client machine
2. Open `public/remote.html` in a web browser
3. Enter the server URL: `http://192.168.1.100:3000`
4. Click "Connect"
5. Your server URL will be saved for future visits

## Scenario 2: Simulator on a Different Machine

Perfect for testing distributed systems or when the simulator needs dedicated resources.

### On the Server Machine:

1. **Start the server:**
   ```bash
   npm run server
   ```

2. **Note your server's IP address** (as described above)
   - Example: 192.168.1.100

### On the Simulator Machine:

**Option A: Using environment variables (recommended)**

**Windows:**
```cmd
set SERVER_URL=192.168.1.100
set SERVER_PORT=3000
npm run sim
```

**Linux/Mac:**
```bash
export SERVER_URL=192.168.1.100
export SERVER_PORT=3000
npm run sim
```

**Option B: Edit the simulator file directly**

Edit `simulator/sim.js` and change:
```javascript
const SERVER_URL = process.env.SERVER_URL || '192.168.1.100';  // Your server IP
const SERVER_PORT = process.env.SERVER_PORT || 3000;
```

Then run:
```bash
npm run sim
```

### On the Client Machine(s):

Same as Scenario 1 - open `http://192.168.1.100:3000/` in any web browser

## Scenario 3: Everything on Different Machines

The ultimate distributed setup.

### Machine 1 (Server):
```bash
npm run server
```
Note IP: 192.168.1.100

### Machine 2 (Simulator):
```bash
set SERVER_URL=192.168.1.100
npm run sim
```

### Machine 3+ (Clients):
- Browser: `http://192.168.1.100:3000/`
- Or use `remote.html` with server URL configured

## Configuration Options

### Server Configuration

**Change the server port:**
```bash
# Windows
set PORT=8080
npm run server

# Linux/Mac
export PORT=8080
npm run server
```

**Change the host binding:**
```bash
# Listen on all interfaces (default)
set HOST=0.0.0.0

# Listen only on localhost (disable remote access)
set HOST=localhost

npm run server
```

### Simulator Configuration

**Change the target server:**
```bash
# Windows
set SERVER_URL=192.168.1.100
set SERVER_PORT=3000
npm run sim

# Linux/Mac
export SERVER_URL=192.168.1.100
export SERVER_PORT=3000
npm run sim
```

### Web Dashboard Configuration

**When opening from file system:**

If you copied the `public` folder to a client PC:
1. Open `remote.html` in a browser
2. Enter server URL in the configuration bar
3. Click "Connect"

**When served by the server:**

The dashboard at `http://<server-ip>:3000/` automatically connects to the server that serves it.

**Custom server URL (advanced):**

Edit `public/index.html` and uncomment/modify:
```html
<script>window.API_BASE_URL = 'http://192.168.1.100:3000';</script>
```

## Troubleshooting

### Dashboard shows "Connection Error"

1. **Check if server is running:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should return: `{"status":"ok",...}`

2. **Check firewall settings:**
   - Ensure port 3000 is not blocked
   - Allow Node.js through Windows Firewall if prompted

3. **Verify IP address:**
   - Make sure you're using the correct server IP
   - Try `http://<ip>:3000/api/health` in browser

### Simulator shows "Cannot connect to server"

1. **Verify SERVER_URL is correct:**
   ```bash
   # Test the server endpoint
   curl http://<server-ip>:3000/api/health
   ```

2. **Check network connectivity:**
   ```bash
   # Windows
   ping <server-ip>
   
   # Linux/Mac
   ping <server-ip>
   ```

3. **Verify port is correct:**
   - Default is 3000
   - Check server output for actual port

### Dashboard loads but shows no data

1. **Check if simulator is running and sending data**
   - Look for green 🟢 indicators in simulator output

2. **Check browser console for errors:**
   - Press F12 to open developer tools
   - Look for network errors or CORS issues

3. **Verify data is reaching server:**
   ```bash
   curl http://<server-ip>:3000/api/telemetry/latest
   ```

## Network Security Considerations

### For Development/Demo Use:
- The current configuration allows connections from any origin (CORS: *)
- No authentication or authorization is implemented
- Suitable for local networks and development

### For Production Use:
If you plan to use this in a production environment:

1. **Restrict CORS to specific origins:**
   Edit `server/index.js`:
   ```javascript
   app.use(cors({ 
     origin: ['http://trusted-domain.com', 'http://192.168.1.50']
   }));
   ```

2. **Add authentication:**
   - Implement API keys or JWT tokens
   - Add user authentication for the dashboard

3. **Use HTTPS:**
   - Deploy behind a reverse proxy (nginx, Apache)
   - Obtain SSL certificates

4. **Set up firewall rules:**
   - Only allow connections from trusted IPs
   - Use VPN for remote access

5. **Implement rate limiting:**
   - Prevent abuse of API endpoints

## Example Deployment Scenarios

### Home Network
```
Server:     Desktop PC (192.168.1.100)
Simulator:  Same desktop PC
Dashboard:  Laptop (192.168.1.50) - http://192.168.1.100:3000/
            Tablet (192.168.1.51) - http://192.168.1.100:3000/
            Phone (192.168.1.52)  - http://192.168.1.100:3000/
```

### Lab/Office Network
```
Server:     Server rack (10.0.1.10)
Simulator:  Raspberry Pi (10.0.1.20) - SERVER_URL=10.0.1.10
Dashboard:  Engineer's laptop (10.0.1.30) - http://10.0.1.10:3000/
            Monitor display (10.0.1.31) - http://10.0.1.10:3000/
```

### Cloud Deployment
```
Server:     AWS/Azure VM (public IP: 203.0.113.10)
Simulator:  Local machine - SERVER_URL=203.0.113.10
Dashboard:  Any browser - http://203.0.113.10:3000/
```
⚠️ **Warning:** Exposing to the internet requires proper security measures!

## Port Forwarding (Optional)

To access your server from outside your local network:

1. **Configure your router:**
   - Log into router admin panel
   - Forward external port 3000 to internal IP (e.g., 192.168.1.100:3000)
   - Note your public IP address (visit whatismyip.com)

2. **Access from outside:**
   - Dashboard: `http://<your-public-ip>:3000/`
   - Simulator: `set SERVER_URL=<your-public-ip>`

⚠️ **Security Warning:** This exposes your server to the internet. Implement security measures first!

## Support

For issues or questions:
1. Check this guide thoroughly
2. Verify all IP addresses and ports are correct
3. Check firewall and network settings
4. Review server logs for error messages
5. Test API endpoints with curl or browser

---

**Happy monitoring! 🏭**
