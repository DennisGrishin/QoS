var socket = io();

socket.on('message', function(data) {
	console.log(data);
});

var movement = {
	up: false,
	down: false,
	left: false,
	right: false,
	space: false
}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 32: // space
      movement.space = true;
      break;
	case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
	
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
	case 32: // space
      movement.space = false;
      break;
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});

socket.emit('new player');

//setInterval(function() {
  //socket.emit('movement', movement);
//}, 1000 / 60);


var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', function(game_state) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	for (var id in game_state.players) {
		var player = game_state.players[id];
		
		var x = player.x;
		var y = player.y;
		var radius = player.size/2;
		var shift = 2;
		var gradient = context.createRadialGradient(x - shift, y - shift, radius, x - shift, y - shift, 0);
		var color = {
			r: player.r,
			g: player.g,
			b: player.b
		};
		var glare = {
			r: Math.round((player.r + 256)/2),
			g: Math.round((player.g + 256)/2),
			b: Math.round((player.b + 256)/2)
		};
		gradient.addColorStop(0, 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')');
		gradient.addColorStop(1, 'rgb(' + glare.r + ', ' + glare.g + ', ' + glare.b + ')');
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(x, y, radius, 0, 2*Math.PI);
		context.fill();
		
		var gun = {
			length: player.size,
			width: player.size/4,
			color: 'rgb(80,30,0)'
		};
		context.translate(x, y);
		context.rotate(-player.direction);
		
		context.fillStyle = gun.color;
		context.fillRect(0, gun.width, gun.length, gun.width);
		context.setTransform(1, 0, 0, 1, 0, 0);
		
		context.fillStyle = 'black';
		context.font = '12px serif';
		context.textAlign = 'center';
		context.fillText(player.score, x, y + 4);
	}
	for (var pack_id in game_state.bullets) {
		var bullet_pack = game_state.bullets[pack_id];
		if (bullet_pack) for (var bullet_id in bullet_pack) {
			var bullet = bullet_pack[bullet_id];
			context.fillStyle = 'blue';
			context.beginPath();
			context.arc(bullet.x, bullet.y, 4, 0, 2*Math.PI);
			context.fill();
		}
	}
	socket.emit('movement', movement);
});





