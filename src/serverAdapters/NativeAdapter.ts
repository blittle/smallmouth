///<reference path="ServerAdapter"/>

module SmallMouth {

	declare var WebSocket: WebSocket;

	export interface WebSocket {
		new(url: string, subprotocols?: string[]): WebSocket;
		readyState: number;
		send(data: any): any;
		onmessage: Function;
		onopen: Function;
	}

	export class NativeAdapter implements SmallMouth.ServerAdapter {

		public socket: WebSocket; 
		public id: string = new Date().getTime() + "";

		private eventListeners;
		private messageQueue: string[];

		constructor() {
			this.eventListeners = {};
			this.messageQueue = [];
		}

		unauth(): ServerAdapter {
			return this;
		}

		authenticated(): boolean {
			return true;
		}

		isConnected(): boolean {
			return true;
		}

		connect(host, authToken?: any, onComplete?: (error) => any): NativeAdapter {

			if(!host || this.socket) return;

			this.socket = new WebSocket(host);

			this.socket.onmessage = (e) => {
				var resp = JSON.parse(e.data);
				if(this.eventListeners[resp.type]) {
					this.eventListeners[resp.type](resp.data);
				}
			};

			this.socket.onopen = () => {
		    	while(this.messageQueue.length) {
		    		this.socket.send(this.messageQueue.splice(0,1)[0]);
		    	}
		   	};

			this.onMessage('ready', (resp) => {
				this.id = resp.id;
			});

			return this;
		}

		onMessage(type: string, callback ?: (resp) => any): NativeAdapter {
			if(this.socket) {
				this.eventListeners[type] = callback;
			}
			return this;
		}

		send(type: string, data: any, onComplete ?: (error) => any): NativeAdapter {
			var packet;

			if(this.socket) {
				packet = JSON.stringify({
					type: type,
					data: data
				});

				if(this.socket.readyState === 1) {
					this.socket.send(packet);
				} else {
					this.messageQueue.push(packet);
				}
			}
			return this;
		}
	}
}