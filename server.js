/**
 * Created by scastillo on 12/10/14.
 */
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);

app.get('/:path?', function (req, res) {
    var path = req.param("path");
    path = path || "index.html";
    res.sendfile(__dirname + '/web/' + path);
});

io.on('connection', function (socket) {
    socket.on('updateData', function (data) {
        socket.emit('updateStream', data);
    });
});