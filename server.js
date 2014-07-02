var server = require('http').createServer(httpHandler);
var	io = require('socket.io').listen(server);
var fs= require('fs');
server.listen(8000);

function httpHandler (req, res) {
	fs.readFile(__dirname + '/index.html', function  (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error');
		}
		res.writeHead(200);
		res.write(data);
		res.end();
	});
}
var players = [];
var counter = 0;

io.sockets.on('connection', function (socket){
	//各プレイヤー情報受信
	var p = {
		"id" : socket.id,
		"x"	: 0,
		"y"	: 0
	};
	players.push(p);

	socket.on('data_change', function (data) {
		for(var i = 0; i < players.length; i++) {
			var pyr = players[i];
			if (pyr["id"] == socket.id) {
				pyr["x"] = data.x;
				pyr["y"] = data.y;
				break;
			}
		}
	});
	setInterval(function () {
		io.sockets.emit("data_players", players);
	}, 33);
	socket.on('disconnect', function () {
		var n = 0;
		for (var i = 0; i < players.length; i++) {
			var pyr = players[i];
			if(pyr["id"] == socket.id) {
				n = i;
				break;
			}
		}
		players.splice(n, 1);
	});
});
