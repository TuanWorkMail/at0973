// Set up Socket.IO to listen on port 8000
var io = require("socket.io"), 			    // Socket.IO
    socket = io.listen(8000);
// Configure Socket.IO
socket.configure(function () {
    // Only use WebSockets
    socket.set("transports", ["websocket"]);

    // Restrict log output
    socket.set("log level", 2);
});
exports.socket = socket;