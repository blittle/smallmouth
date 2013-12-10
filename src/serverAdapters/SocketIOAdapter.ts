///<reference path="ServerAdapter"/>
///<reference path="../../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts"/>

module SmallMouth {

	export class SocketIOAdapter implements SmallMouth.ServerAdapter {

		public socket: Socket; 
		public id: string = new Date().getTime() + "";

		private connected = false;
		private isAuthenticated = true;
		private needsAuth = false;

		constructor() {
		}

		connect(host, authToken?: any, onComplete?: (error) => any): SocketIOAdapter {

			if(!host) return;

			if(authToken) {
				this.isAuthenticated = false;
				this.needsAuth = true;
			}

			if(this.socket) {
				this.socket = io.connect(host, authToken ? {
					query: "token=" + authToken,
					"force new connection": true
				} : null);
			} else {
				this.socket = io.connect(host, authToken ? {
					query: "token=" + authToken
				} : null);
			}

			this.onMessage('ready', (resp) => {
				this.id = resp.id;
			});

			this.onMessage('connect', (resp) => {
				this.connected = true;
				this.isAuthenticated = true;
				if(onComplete) onComplete.call(null);
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