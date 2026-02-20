// Dashboard Application
class TelemetryDashboard {
    constructor() {
        this.updateInterval = 1000;
        this.chartData = [];
        this.maxChartPoints = 60;
        this.canvas = document.getElementById('temperature-chart');
        this.ctx = this.canvas.getContext('2d');
        this.initChart();
        this.startUpdates();
    }

    initChart() {
        // Set canvas size
        this.canvas.width = this.canvas.parentElement.clientWidth - 30;
        this.canvas.height = 270;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = this.canvas.parentElement.clientWidth - 30;
            this.drawChart();
        });
    }

    async fetchLatest() {
        try {
            const response = await fetch('/api/telemetry/latest');
            if (response.ok) {
                const data = await response.json();
                this.updateLatestValues(data);
                this.updateConnectionStatus(true);
                return data;
            } else if (response.status === 404) {
                this.updateConnectionStatus(true, 'Waiting for data...');
            }
            else if (response.status === 304) {
                this.updateConnectionStatus(false, 'Server error');
            }
        } catch (error) {
            console.error('Error fetching latest data:', error);
            this.updateConnectionStatus(false);
        }
        return null;
    }

    async fetchHistory(limit = 60) {
        try {
            const response = await fetch(`/api/telemetry/history?limit=${limit}`);
            if (response.ok) {
                const result = await response.json();
                return result.data;
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
        return [];
    }

    updateLatestValues(data) {
        // Update timestamp
        const timestamp = new Date(data.timestamp);
        document.getElementById('last-update').textContent = timestamp.toLocaleTimeString();
        
        // Update machine state
        const stateElement = document.getElementById('machine-state');
        const stateCard = document.getElementById('state-card');
        stateElement.textContent = data.machineState;
        stateCard.className = 'card state-' + data.machineState;
        document.getElementById('state-timestamp').textContent = timestamp.toLocaleTimeString();
        
        // Update temperature
        document.getElementById('temperature').textContent = data.temperature.toFixed(1);
        
        // Update cycle time
        document.getElementById('cycle-time').textContent = data.cycleTimeMs;
        
        // Update counts
        document.getElementById('good-count').textContent = data.goodCount;
        document.getElementById('reject-count').textContent = data.rejectCount;
        
        // Calculate quality rate
        const totalParts = data.goodCount + data.rejectCount;
        const qualityRate = totalParts > 0 ? ((data.goodCount / totalParts) * 100).toFixed(1) : '--';
        document.getElementById('quality-rate').textContent = qualityRate === '--' ? '--' : qualityRate;
    }

    updateConnectionStatus(connected, message = null) {
        const statusIndicator = document.getElementById('connection-status');
        const statusText = document.getElementById('status-text');
        
        if (connected) {
            statusIndicator.className = 'status-indicator connected';
            statusText.textContent = message || 'Connected';
        } else {
            statusIndicator.className = 'status-indicator error';
            statusText.textContent = 'Connection Error';
        }
    }

    async updateHistory() {
        const history = await this.fetchHistory(10);
        const tbody = document.getElementById('history-body');
        
        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No data available</td></tr>';
            return;
        }
        
        // Reverse to show most recent first
        const recentHistory = [...history].reverse();
        
        tbody.innerHTML = recentHistory.map(item => {
            const time = new Date(item.timestamp).toLocaleTimeString();
            return `
                <tr>
                    <td>${time}</td>
                    <td><span class="state-badge state-${item.machineState}">${item.machineState}</span></td>
                    <td>${item.temperature.toFixed(1)}</td>
                    <td>${item.cycleTimeMs}</td>
                    <td>${item.goodCount}</td>
                    <td>${item.rejectCount}</td>
                </tr>
            `;
        }).join('');
    }

    async updateChart() {
        const history = await this.fetchHistory(this.maxChartPoints);
        this.chartData = history;
        this.drawChart();
    }

    drawChart() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = { top: 20, right: 40, bottom: 40, left: 50 };
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (this.chartData.length === 0) {
            ctx.fillStyle = '#95a5a6';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Waiting for data...', width / 2, height / 2);
            return;
        }
        
        // Get temperature values
        const temperatures = this.chartData.map(d => d.temperature);
        const minTemp = Math.min(...temperatures) - 5;
        const maxTemp = Math.max(...temperatures) + 5;
        
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight * i / 5);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            
            // Y-axis labels
            const temp = maxTemp - ((maxTemp - minTemp) * i / 5);
            ctx.fillStyle = '#666';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(temp.toFixed(1) + '°C', padding.left - 10, y + 4);
        }
        
        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();
        
        // Draw line
        if (this.chartData.length > 0) {
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            this.chartData.forEach((point, index) => {
                const x = padding.left + (chartWidth * index / ((this.chartData.length - 1) || 1));
                const normalizedTemp = (point.temperature - minTemp) / (maxTemp - minTemp);
                const y = height - padding.bottom - (chartHeight * normalizedTemp);
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw points
            ctx.fillStyle = '#e74c3c';
            this.chartData.forEach((point, index) => {
                const x = padding.left + (chartWidth * index / ((this.chartData.length - 1) || 1));
                const normalizedTemp = (point.temperature - minTemp) / (maxTemp - minTemp);
                const y = height - padding.bottom - (chartHeight * normalizedTemp);
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            });
            
            // X-axis labels (show first, middle, last timestamp)
            ctx.fillStyle = '#666';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            
            const labelIndices = [0, Math.floor(this.chartData.length / 2), this.chartData.length - 1];
            labelIndices.forEach(index => {
                if (index < this.chartData.length) {
                    const x = padding.left + (chartWidth * index / ((this.chartData.length - 1) || 1));
                    const time = new Date(this.chartData[index].timestamp).toLocaleTimeString();
                    ctx.fillText(time, x, height - padding.bottom + 20);
                }
            });
        }
        
        // Chart title
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Temperature (°C) over Time', width / 2, 15);
    }

    async update() {
        await this.fetchLatest();
        await this.updateHistory();
        await this.updateChart();
    }

    startUpdates() {
        // Initial update
        this.update();
        
        // Set up periodic updates
        setInterval(() => {
            this.update();
        }, this.updateInterval);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Telemetry Dashboard...');
    new TelemetryDashboard();
});
