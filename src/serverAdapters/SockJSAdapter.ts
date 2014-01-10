///<reference path="ServerAdapter"/>
///<reference path="../../d.ts/DefinitelyTyped/sockjs/sockjs.d.ts"/>
///<reference path="../../d.ts/DefinitelyTyped/node/node.d.ts"/>

module SmallMouth {

	// Check for CommonJS (nodejs) and load SockJS subsequently
	if(typeof require == 'function' ) {
		 var NodeSockJS = require('sockjs-client-node');
	}

	export class SockJSAdapter implements SmallMouth.ServerAdapter {

		public socket: SockJS; 
		public id: string = new Date().getTime() + "";

		private eventListeners;
		private messageQueue: string[];

		private needsAuth = false;
		private authenticated = false;

		constructor() {
			this.eventListeners = {};
			this.messageQueue = [];
		}

		connect(
			host: string, 
			auth?: SmallMouth.AuthInterface, 
			onComplete?: (error) => any
		): SockJSAdapter {

			if(!host || this.socket) return;

			this.socket = new (NodeSockJS ? NodeSockJS : SockJS)(host);

			this.socket.onmessage = (e) => {
				var resp = JSON.parse(e.data);
				if(this.eventListeners[resp.type]) {
					this.eventListeners[resp.type](resp.data);
				}
			};

			this.socket.onopen = () => {
		    	this.socket.send({
					type: 'auth',
					data: {
						jsessionid: "",
						sf2sessionid: ""
					}
				});
		   	};

		   	this.onMessage('auth', (resp: any) => {
		   		if(resp.data.success) {
		   			this.authenticated = true;

		   			while(this.messageQueue.length) {
			    		this.socket.send(this.messageQueue.splice(0,1)[0]);
			    	}
		   		} else {
		   			this.authenticated = false;
		   		}
	   		});

			this.onMessage('ready', (resp) => {
				this.id = resp.id;
			});

			return this;
		}

		unauth(): ServerAdapter {
			this.authenticated = false;
			return this;
		}

		isAuthenticated(): boolean {
			return this.authenticated;
		}

		isConnected(): boolean {
			return this.socket.readyState === SockJS.OPEN && this.authenticated;
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

				if(this.socket.readyState === SockJS.OPEN && this.authenticated) {
					this.socket.send(packet);
				} else {
					this.messageQueue.push(packet);
				}
			}
			return this;
		}
	}
}