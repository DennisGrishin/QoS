// Dependencies
//console.log("Hello!");
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

var port = 5000;

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(port, function() {
  console.log('Starting server on port ' + port);
});

// Add the WebSocket handlers
io.on('connection', function(socket) {
});

/*setInterval(function() {
  io.sockets.emit('message', 'hi!');
}, 1000);
*/

var players = {};
io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = {
      x: 300,
      y: 300,
	  r: Math.floor(Math.random()*256),
	  g: Math.floor(Math.random()*256),
	  b: Math.floor(Math.random()*256)
    };
  });
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
	var LEFT_BORDER = 0;
	var RIGHT_BORDER = 800;
	var TOP_BORDER = 0;
	var BOTTOM_BORDER = 600;
	var step = 5;
    if (data.left) {
      player.x -= step;
	  if (player.x < LEFT_BORDER) {
		player.x = RIGHT_BORDER;
	  }

    }
    if (data.up) {
		if (player.y < TOP_BORDER) {
			player.y = BOTTOM_BORDER;
		}
		player.y -= step;
    }
    if (data.right) {
		if (player.x > RIGHT_BORDER) {
			player.x = LEFT_BORDER;
		}
		player.x += step;
    }
    if (data.down) {
		if (player.y > BOTTOM_BORDER) {
			player.y = TOP_BORDER;
		}
		player.y += step;
    }
  });
});
setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);





