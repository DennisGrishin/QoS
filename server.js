// Dependencies
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

var LEFT_BORDER = 0;
var RIGHT_BORDER = 800;
var TOP_BORDER = 0;
var BOTTOM_BORDER = 600;


var game_state = {
	players: {},
	bullets: {}
};

function obj_size(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function spawn() {
	return {
		x: LEFT_BORDER + (RIGHT_BORDER - LEFT_BORDER)*Math.random(),
		y: TOP_BORDER + (BOTTOM_BORDER - TOP_BORDER)*Math.random(),
		size: 30,
		direction: Math.round(2*Math.PI*Math.random()*64)/64,
		r: Math.floor(Math.random()*256),
		g: Math.floor(Math.random()*256),
		b: Math.floor(Math.random()*256),
		score: 0,
		reload_time: 0 
	};
}

function respawn(player) {
	player.x = LEFT_BORDER + (RIGHT_BORDER - LEFT_BORDER)*Math.random();
	player.y = TOP_BORDER + (BOTTOM_BORDER - TOP_BORDER)*Math.random();
	player.direction = Math.round(2*Math.PI*Math.random()*64)/64;
}

io.on('connection', function(socket) {
	socket.on('new player', function() {
		game_state.players[socket.id] = spawn();
	});
	
	socket.on('movement', function(data) {
		var player = game_state.players[socket.id] || {};
		var step = 5;
		var rotation_step = 2*Math.PI/64;
		var size = player.size;
		if (data.left) {
			player.direction += rotation_step;
		}
		if (data.right) {
			player.direction -= rotation_step;
		}
		
		if (data.up) {
			player.x += step*Math.cos(player.direction);
			player.y -= step*Math.sin(player.direction);
		}
		
		if (data.down) {
			player.x -= step*Math.cos(player.direction);
			player.y += step*Math.sin(player.direction);
		}
		
		// Border conditions
		if (player.x < LEFT_BORDER + size/2) {
			player.x = LEFT_BORDER + size/2;
		}
		if (player.y < TOP_BORDER + size/2) {
			player.y = TOP_BORDER + size/2;
		}
		if (player.x > RIGHT_BORDER - size/2) {
			player.x = RIGHT_BORDER - size/2;
		}
		if (player.y > BOTTOM_BORDER - size/2) {
			player.y = BOTTOM_BORDER - size/2;
		}
		
		// Bullet
		var bullet_speed = step*1.5;
		if (!game_state.bullets[socket.id]) {
			game_state.bullets[socket.id] = {};
		}
		var bullet_pack = game_state.bullets[socket.id];
		for (var bullet_id in bullet_pack) {
			bullet = bullet_pack[bullet_id];
			bullet.x += bullet_speed*Math.cos(bullet.direction);
			bullet.y -= bullet_speed*Math.sin(bullet.direction);
			if (bullet.x < LEFT_BORDER || 
				bullet.x > RIGHT_BORDER ||
				bullet.y < TOP_BORDER ||
				bullet.y > BOTTOM_BORDER) {
				delete bullet_pack[bullet_id];
			}
		}
		var shoot_interval = 15;
		//io.sockets.emit('message', ' ' + player.reload_time);
		if (data.space && player.reload_time > shoot_interval) {
			player.reload_time = 0;
			var dist = 35;
			var shift = 10;
			game_state.bullets[socket.id][Math.random()*1000] = {
				x: player.x + shift*Math.sin(player.direction) + dist*Math.cos(player.direction),
				y: player.y + shift*Math.cos(player.direction) - dist*Math.sin(player.direction),
				direction: player.direction
			}
		}
		player.reload_time += 1;
		
		// Destroy conditions
		for (var pack_id in game_state.bullets) {
			for (var bullet_id in game_state.bullets[pack_id]) {
				var killer = game_state.bullets[pack_id][bullet_id];
				var relpos = {
					x: killer.x - player.x,
					y: killer.y - player.y
				}
				if (relpos.x*relpos.x + relpos.y*relpos.y < size*size/4) {
					//player.x = 300;
					//player.y = 300;
					//io.sockets.emit('message', 'hi!');
					if (game_state.players[pack_id]) {
						game_state.players[pack_id].score += 1;
					}
					respawn(game_state.players[socket.id]);
				}
				//io.sockets.emit('message', ' ' + Math.sqrt(relpos.x*relpos.x + relpos.y*relpos.y));
			}
		}
	});
	
	socket.on('disconnect', function() {
		delete game_state.players[socket.id];
	});
});


  
setInterval(function() {
  io.sockets.emit('state', game_state);
}, 1000 / 60);





