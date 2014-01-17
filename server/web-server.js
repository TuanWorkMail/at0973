var express = require('express'),
    app = express(),
    path = require("path"),
    port = 80;
app.use('/', express.static('../'));
app.listen(port, function() { console.log('localhost:'+port) });
