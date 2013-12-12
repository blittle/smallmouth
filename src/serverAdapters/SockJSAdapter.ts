///<reference path="ServerAdapter"/>
///<reference path="../../d.ts/DefinitelyTyped/sockjs/sockjs.d.ts"/>
///<reference path="../../d.ts/DefinitelyTyped/node/node.d.ts"/>

module SmallMouth {

	// Check for CommonJS (nodejs) and load SockJS subsequently
	var SockJS = typeof require == 'function' ? require('sockjs-client-node') : SockJS;

	export class SockJSAdapter implements SmallMouth.ServerAdapter {

		public socket: SockJS; 
		public id: string = new Date().getTime() + "";

		private eventListeners;
		private messageQueue: string[];

		constructor() {
			this.eventListeners = {};
			this.messageQueue = [];
		}

		connect(host, authToken?: any, onComplete?: (error) => any): SockJSAdapter {

			if(!host || this.socket) return;

			this.socket = new SockJS(host);

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

		unauth(): ServerAdapter {
			return this;
		}

		authenticated(): boolean {
			return true;
		}

		isConnected(): boolean {
			return true;
		}

		onMessage(type: string, callback ?: (resp) => any): SockJSAdapter {
			if(this.socket) {
				this.eventListeners[type] = callback;
			}
			return this;
		}

		send(type: string, data: any, onComplete ?: (error) => any): SockJSAdapter {
			var packet;

			if(this.socket) {
				packet = JSON.stringify({
					type: type,
					data: data
				});

				if(this.socket.readyState === SockJS.OPEN) {
					this.socket.send(packet);
				} else {
					this.messageQueue.push(packet);
				}
			}
			return this;
		}
	}
}