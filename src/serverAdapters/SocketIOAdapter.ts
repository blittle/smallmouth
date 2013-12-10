///<reference path="ServerAdapter"/>
///<reference path="../../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts"/>

module SmallMouth {

	export class SocketIOAdapter implements SmallMouth.ServerAdapter {

		public socket: Socket; 
		public id: string = new Date().getTime() + "";

		private connected = false;
		private isAuthenticated = true;

		constructor() {

		}

		connect(host): SocketIOAdapter {

			if(!host || this.socket) return;

			this.socket = io.connect(host);

			this.onMessage('ready', (resp) => {
				this.id = resp.id;
			});

			this.onMessage('connect', (resp) => {
				this.connected = true;
				this.isAuthenticated = true;
			});

			this.onMessage('disconnect', (resp) => {
				this.connected = false;
			});

			this.onMessage('error', (reason) => {
				this.connected = false;
				this.isAuthenticated = false;
				console.error('Unable to connect to LargeMouth backend', reason);
			});

			return this;
		}

		auth(authToken): ServerAdapter {
			this.isAuthenticated = false;
			return this;
		}

		unauth(): ServerAdapter {
			this.isAuthenticated = false;
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