///<reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts"/>
///<reference path="interfaces/ServerAdapter"/>

module SmallMouth {

	export class LargeMouthAdapter implements SmallMouth.ServerAdapter {

		private _socket: Socket;
		private _callbacks: {};
		private _callbackId = 0;
		private _host: string;

		constructor(host: string) {
			this.connect(host);
			this._host = host;
			this._callbacks = {};
		}

		private generateCallbackId() {
			return ++this._callbackId;
		}

		connect( host: string ): LargeMouthAdapter {
			var socket;

			// If in localstorage mode, the host should be null
			// and we don't need to connect. If we have already 
			// connected, don't try again
			if(!host || this._socket) return;

			this._socket = socket = io.connect(host);

			socket.on('set', (resp) => {
				SmallMouth.DataRegistry.getDataRegistry(this._host).serverSetData(resp.path, resp.value);

				var registryData = SmallMouth.DataRegistry.getDataRegistry(this._host).getData(resp.path);	

				SmallMouth._eventRegistry.triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(
					resp.path,
					registryData,
					host
				), {remote: true});
			});

			socket.on('update', (resp) => {
				SmallMouth.DataRegistry.getDataRegistry(this._host).serverUpdateData(resp.path, resp.value);

				var registryData = SmallMouth.DataRegistry.getDataRegistry(this._host).getData(resp.path);	

				SmallMouth._eventRegistry.triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(
					resp.path,
					registryData,
					host
				), {remote: true});
			});

			socket.on('syncComplete', (resp) => {
				this.executeCallback(resp.reqId, resp.err);
			});

			socket.on('ready', (resp) => {
				this._socket.id = resp.id;
			});

			return this;
		}

		executeCallback(id, err) {
			if(typeof this._callbacks[id] == 'function') {
				this._callbacks[id](err);
				delete this._callbacks[id];
			}
		}

		subscribe( url: string ): LargeMouthAdapter {
			if(!this._socket) return;

			this._socket.emit('subscribe', {
				url: url,
				value: SmallMouth.DataRegistry.getDataRegistry(this._host).getData(url)
			});
			return this;
		}

		syncRemote(data, url: string, onComplete ?: (error) => any): LargeMouthAdapter {

			if(!this._socket) return;

			if(typeof onComplete == 'function') {
				var callbackId = this.generateCallbackId();
				this._callbacks[callbackId] = onComplete;
			}

			this._socket.emit('set', {
				url: url,
				value: data,
				reqId: callbackId	
			});

			return this;
		}

		generateId(): string {
			var id = (new Date()).getTime() + "";
			if(this._socket) id = this._socket.id + '-' + id;
			return id;
		}
	}
}