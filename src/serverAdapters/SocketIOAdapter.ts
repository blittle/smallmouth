///<reference path="ServerAdapter"/>
///<reference path="../../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts"/>
///<reference path="../../d.ts/DefinitelyTyped/node/node.d.ts"/>

module SmallMouth {
	var nodeio;

	if(typeof require == 'function' ) {
		 nodeio = require('socket.io-client');
	}

	export class SocketIOAdapter implements SmallMouth.ServerAdapter {

		public socket: Socket; 
		public id: string = new Date().getTime() + "";

		private host: string;

		private connected = false;
		private isAuthenticated = true;
		private needsAuth = false;
		private isConnecting = false;

		private messageQueue = [];

		constructor() {
		}

		connect(
			host: string, 
			auth?: SmallMouth.AuthInterface, 
			onComplete?: (error) => any
		): SocketIOAdapter {

			if(!host || this.isConnecting) return;

			this.host = host;

			this.isConnecting = true;

			var authQuery = "";

			if(auth) {
				this.isAuthenticated = false;
				this.needsAuth = true;
			}

			if(this.socket) {
				this.socket = (nodeio ? nodeio : io).connect(host, auth ? {
					"force new connection": true
				} : null);
			} else {
				this.socket = (nodeio ? nodeio : io).connect(host, auth ? {
				} : null);
			}

			this.onMessage('auth', (resp) => {
				if(!resp.token) {
					return this.socket.disconnect();
				}

				this.id = resp.id;
				SmallMouth.auth.setAuthToken(host, resp.token);

				this.connected = true;
				this.isAuthenticated = true;
				this.isConnecting = false;

				if(onComplete) onComplete.call(null);

				while(this.messageQueue.length) {
					var m = this.messageQueue.splice(0, 1)[0];
					this.socket.emit(m.type, m.data, m.onComplete);
				}
			});

			this.onMessage('ready', (resp) => {
				this.socket.emit('auth', auth);
			});

			this.onMessage('disconnect', (resp) => {
				this.unauth();
			});

			this.onMessage('error', (reason) => {
				if(onComplete) onComplete.call(null, reason);
			});

			this.onMessage('authError', (message) => {
				this.unauth();
				if(onComplete) onComplete.call(null, message);
			});

			return this;
		}

		unauth(): ServerAdapter {
			if(this.needsAuth) {
				this.isAuthenticated = false;
				this.connected = false;
				this.isConnecting = false;

				if(this.socket) this.socket.disconnect();
				SmallMouth.auth.removeAuthToken(this.host);
			}

			return this;
		}

		authenticated(): boolean {
			return this.isAuthenticated;
		}

		onMessage(type: string, callback ?: (resp) => any): SocketIOAdapter {
			if(this.socket) this.socket.on(type, callback);
			return this;
		}

		send(type: string, data: any, onComplete ?: (error) => any): SocketIOAdapter {
			if(this.socket && this.connected && this.isAuthenticated && !this.isConnecting) this.socket.emit(type, data, onComplete);
			else {
				this.messageQueue.push({
					type: type,
					data: data,
					onComplete: onComplete
				});
			}
			return this;
		}

		isConnected(): boolean {
			return this.connected;
		}
	}
}