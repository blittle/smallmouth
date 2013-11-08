///<reference path="ServerAdapter"/>
///<reference path="../../d.ts/DefinitelyTyped/sockjs/sockjs.d.ts"/>

module SmallMouth {

	export class SockJSAdapter implements SmallMouth.ServerAdapter {

		public socket: SockJS; 
		public id: string = new Date().getTime() + "";

		private eventListeners;

		constructor() {
			this.eventListeners = {};
		}

		connect(host): SockJSAdapter {

			if(!host || this.socket) return;

			this.socket = new SockJS(host);

			this.socket.onmessage = (e) => {
				var resp = JSON.parse(e.data);
				if(this.eventListeners[resp.type]) {
					this.eventListeners[resp.type](resp.data);
				}
			};

			this.onMessage('ready', (resp) => {
				this.id = resp.id;
			});

			return this;
		}

		onMessage(type: string, callback ?: (resp) => any): SockJSAdapter {
			if(this.socket) {
				this.eventListeners[type] = callback;
			}
			return this;
		}

		send(type: string, data: any, onComplete ?: (error) => any): SockJSAdapter {
			if(this.socket) {
				this.socket.send(JSON.stringify({
					type: type,
					data: data
				}));
			}
			return this;
		}
	}
}