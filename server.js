// サーバー構築
var server = require('http').createServer(function(req, res) {
	fs.readFile(__dirname + '/index.html', function(err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error');
		}
		res.writeHead(200);
		res.write(data);
		res.end();
	});
});

// サーバー待ち受け開始
server.listen(8000);
console.log("server listening...");

// モジュール読み込み
var	io = require('socket.io').listen(server);
var fs= require('fs');

// 全プレイヤー情報格納配列
var players = [];

// AIプレイヤー情報格納配列
var aiPlayers = [];
// AIプレイヤー数
var aiNumber = 300;

// AI用意
for (var i = 0; i < aiNumber; i++) {
	aiPlayers.push(new AI(300, 240, Math.random() * 5, Math.random() * 5));
}

// AI定義
function AI(x, y, vX, vY) {
	this.x = x;
	this.y = y;
	this.vX = vX;
	this.vY = vY;
}
// 移動
AI.prototype.move = function() {
	// 壁との当たり判定
	if (this.x < 0 || this.x > 600) {
		this.vX = - this.vX;
	}
	
	if (this.y < 0 || this.y > 480) {
		this.vY = - this.vY;
	}

	this.x += this.vX;
	this.y += this.vY;
}

// プレイヤー接続処理
io.sockets.on('connection', function(socket) {
	// プレイヤー情報登録
	var p = {
		id : socket.id,
		x	: 0,
		y	: 0
	};
	players.push(p);

	// プレイヤー状態受信
	socket.on('data_update', function(data) {
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
	socket.on('disconnect', function() {
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
setInterval(function() {
	// AI更新
	for (var i = 0; i < aiNumber; i++) {
		aiPlayers[i].move();
	}
	// AI情報更新
	io.sockets.emit("data_ai", aiPlayers);

	// 各プレイヤー位置情報送信
	io.sockets.emit("data_players", players);
}, 33);