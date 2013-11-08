///<reference path="ServerAdapter"/>
///<reference path="../../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts"/>

module SmallMouth {
	export class SocketIOAdapter implements SmallMouth.ServerAdapter {

		public socket: Socket; 
		public id: string = new Date().getTime() + "";

		constructor() {

		}

		connect(host): SocketIOAdapter {

			if(!host || this.socket) return;

			this.socket = io.connect(host);

			this.onMessage('ready', (resp) => {
				this.id = resp.id;
			});

			return this;
		}

		onMessage(type: string, callback ?: (resp) => any): SocketIOAdapter {
			if(this.socket) this.socket.on(type, callback);
			return this;
		}

		send(type: string, data: any, onComplete ?: (error) => any): SocketIOAdapter {
			if(this.socket) this.socket.emit(type, data, onComplete);
			return this;
		}
	}
}