// Import the built-in http module - no installation needed
const http = require("http");

// Define where the server will listen
const host = 'localhost';  // Only accessible from this machine
const port = 8000;          // Common development port

// Request listener: handles every incoming HTTP request
const requestListener = function (req, res) {
    // Set HTTP status code to 200 (OK)
    res.writeHead(200);
    
    // Send the response body and close the connection
    res.end("My first server!");
};

// Create the server with our request listener
const server = http.createServer(requestListener);

// Start listening for connections
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});