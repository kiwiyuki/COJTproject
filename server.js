// モジュール読み込み
var server = require('http').createServer(httpHandler);
var	io = require('socket.io').listen(server);
var fs= require('fs');

// サーバー待ち受け開始
server.listen(8000);
console.log("server listening...");

// HTTPハンドラ
function httpHandler (req, res) {
	fs.readFile(__dirname + '/index.html', function(err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error');
		}
		res.writeHead(200);
		res.write(data);
		res.end();
	});
}

// 全プレイヤー情報格納配列
var players = [];

// プレイヤー接続処理
io.sockets.on('connection', function (socket){
	// プレイヤー情報登録
	var p = {
		id : socket.id,
		x	: 0,
		y	: 0
	};
	players.push(p);

	// プレイヤー状態受信
	socket.on('data_update', function (data) {
		for(var i = 0; i < players.length; i++) {
			var pyr = players[i];

			if (pyr.id == socket.id) {
				pyr.x = data.x;
				pyr.y = data.y;
				break;
			}
		}
	});

	// 切断処理
	socket.on('disconnect', function () {
		var n = 0;
		for (var i = 0; i < players.length; i++) {
			var pyr = players[i];
			if(pyr.id == socket.id) {
				n = i;
				break;
			}
		}
		players.splice(n, 1);
	});
});

// ループ処理
setInterval(function () {
	// 各プレイヤー位置情報送信
	io.sockets.emit("data_players", players);
}, 33);
