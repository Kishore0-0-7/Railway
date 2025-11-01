const app = require("./app.js");
const os = require('os');

const PORT = 5127;
const HOST = '0.0.0.0'; // bind to all interfaces so LAN IPs can reach the server

// Start server
const server = app.listen(PORT, HOST, () => {
        console.log('='.repeat(50));
        console.log(`Server running on: http://localhost:${PORT}`);

        // attempt to find a LAN IPv4 address to display
        
});

// Handle server errors
server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use`);
        } else {
                console.error('Server error:', error);
        }
        process.exit(1);
});