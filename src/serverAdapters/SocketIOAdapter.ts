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

		private connected = false;
		private isAuthenticated = true;
		private needsAuth = false;

		constructor() {
		}

		connect(
			host: string, 
			auth?: SmallMouth.AuthInterface, 
			onComplete?: (error) => any
		): SocketIOAdapter {

			if(!host) return;

			var authQuery = "";

			if(auth) {
				this.isAuthenticated = false;
				this.needsAuth = true;
				auth.authToken = auth.authToken || SmallMouth.auth.getAuthToken(host);
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
				if(onComplete) onComplete.call(null);
			});

			this.onMessage('ready', (resp) => {
				this.socket.emit('auth', auth);
			});

			this.onMessage('disconnect', (resp) => {
				this.connected = false;
				this.isAuthenticated = false;
			});

			this.onMessage('error', (reason) => {
				this.connected = false;
				this.isAuthenticated = false;
				console.error('Unable to connect to LargeMouth backend', reason);
				if(onComplete) onComplete.call(null, reason);
			});

			return this;
		}

		unauth(): ServerAdapter {
			if(this.needsAuth) this.isAuthenticated = false;
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
			if(this.socket) this.socket.emit(type, data, onComplete);
			return this;
		}

		isConnected(): boolean {
			return this.connected;
		}
	}
}