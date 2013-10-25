// Set up Socket.IO to listen on port 8000
var io = require("socket.io").listen(8000);		    // Socket.IO
exports.socket = io.sockets;
// Configure Socket.IO
io.configure(function () {
    // Only use WebSockets
    io.set("transports", ["websocket"]);

    // Restrict log output
    io.set("log level", 2);
});