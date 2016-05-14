window.onload = function () {
	var chat = new Chat();
	chat.init();

}

var Chat = function () {
	this.socket = null;
}

Chat.prototype = {
	init : function () {
		
		var This = this;
		//建立到服务器的链接
		this.socket = io.connect();
		
		//监听socket事件
		this.socket.on('connect', function () {
			
			document.getElementById('info').textContent = "set yourself a name:";
			document.getElementById('nickWrapper').style.display = 'block';
			document.getElementById('nickNameInput').focus();
		})

		//昵称设置
		document.getElementById('loginBtn').addEventListener('click', function(){
			var nickName = document.getElementById('nickNameInput').value;
			
			if(nickName.trim().length ==0) {
				document.getElementById('nickNameInput').focus();
			}else {
				This.socket.emit('login', nickName)
			}
		}, false)

		//昵称已存在事件
		this.socket.on('nickExisted', function () {
			document.getElementById('info').textContent = "用户名已存在！！";
		})
		//昵称符合事件
		this.socket.on('loginSuccess', function () {
			document.title = 'chat:' + document.getElementById('nickNameInput').value;
			document.getElementById('loginWrapper').style.display = "none";
			document.getElementById('messageInput').focus();
		})
		//systemMsg事件
		this.socket.on('systemMsg', function (nickName, userCount, type) {
			//判断用户链接还是短线
			var msg = nickName + (type == 'login' ? ' is coming' : 'left');
			/*var p = document.createElement('p');
			p.textContent = msg;
			document.getElementById('historyMsg').appendChild(p);*/

			//指定系统消息为红色
			This._displayNewMessage('systemMsg', msg, 'red');
			
			//显示在线人数
			document.getElementById('status').textContent = userCount + (userCount > 1 ? 'users' : 'user') + ' online';
			
		})
		//发送文本信息事件
		document.getElementById('sendBtn').addEventListener('click', function () {
			var messageInput = document.getElementById('messageInput');
			var msg = messageInput.value;
			var color = document.getElementById('colorStyle').value;
			messageInput.value = '';
			messageInput.focus();

			if (msg.trim().length !== 0) {
				This.socket.emit('postMsg', msg, color);
				This._displayNewMessage('me', msg, color);
			}

		}, false)
		//文本信息上传
		this.socket.on('newMsg', function (user, msg, color) {
			This._displayNewMessage(user, msg, color);
		})
		//发送图片信息事件
		document.getElementById('sendImage').addEventListener('change', function () {
			//检查文件是否被选中
			if (this.files.length !== 0) {
				var file = this.files[0];
				var reader = new FileReader();
				if (!reader) {
					This._displayNewMessage('systemMsg', 'your browser dosen\'t support FileReader！', 'red');
					this.value = '';
					return;
				}
				reader.onload = function (e) {
					this.value = '';
					This.socket.emit('img', e.target.result);
					This._displayNewImage('me', e.target.result);
				}
				reader.readAsDataURL(file);
			}
		}, false)
		//图片信息上传
		this.socket.on('newImg', function (user, img) {
			This._displayNewImage(user,img)
		})

		//按键操作
		document.getElementById('nickNameInput').addEventListener('keyup', function (e) {
			if (e.keyCode === 13) {
				var nickName = document.getElementById('nickNameInput').value;
				if (nickName.trim().length !== 0) {
					This.socket.emit('login', nickName);
				}
			}
		}, false)
		document.getElementById('messageInput').addEventListener('keyup', function (e) {
			if (e.keyCode === 13) {
				var messageInput = document.getElementById('messageInput');
				var msg = messageInput.value;
				messageInput.value = '';
				messageInput.focus();
				if (msg.trim().length !== 0) {
					This.socket.emit('postMsg', msg);
					This._displayNewMessage('me', msg);

				}
			}
		})
	},

	_displayNewMessage : function (user, msg, color) {
		var container = document.getElementById('historyMsg'),
			msgToDisplay = document.createElement('p'),
			date = new Date().toTimeString().substr(0,8);
		msgToDisplay.style.color = color || '#000';
		
		msgToDisplay.innerHTML = user + '<span class="timeSpan">(' +date+ '): <span><br/>' + '<span class="msgSpan">'+msg+'</span>';
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;

	},
	_displayNewImage : function (user, imgData, color) {
		var container = document.getElementById('historyMsg'),
			msgToDisplay = document.createElement('a'),
			date = new Date().toTimeString().substr(0,8);
		msgToDisplay.innerHTML = user + '<span class="timeSpan">(' +date+ '): <span><br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
		container.appendChild(msgToDisplay);	
		container.scrollTop = container.scrollHeight;
	}
	
}
