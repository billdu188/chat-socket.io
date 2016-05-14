var express = require('express')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var users = [];
var port = process.env.PORT || 3000
server.listen(port);
app.use(express.static(__dirname + '/public'));
//socket部分
io.on('connect', function(socket) {
	
	//昵称设置
	socket.on('login', function(nickname) {
		
		if (users.indexOf(nickname) > -1) {
			socket.emit('nickExisted')
		}else {
			socket.userIndex = users.length;
			socket.nickname = nickname;
			users.push(nickname);
			socket.emit('loginSuccess');
			//向当前所有链接到服务器的客户端发送当前用户昵称
			io.sockets.emit('systemMsg', nickname, users.length, 'login');
		}
		//console.log(users);
	})
	//断开链接
	socket.on('disconnect', function () {
		users.splice(socket.userIndex, 1);
		console.log(users);
		socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
		
	})
	//接收消息
	socket.on('postMsg', function (msg, color) {
		socket.broadcast.emit('newMsg', socket.nickname, msg, color);
	})
	//接收图片
	socket.on('img', function (imgData) {
		//通过newImg事件分发到除自己外的用户
		socket.broadcast.emit('newImg', socket.nickname, imgData);
	})
})



