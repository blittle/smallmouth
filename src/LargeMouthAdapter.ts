///<reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts"/>
///<reference path="DataRegistry"/>
///<reference path="Resource"/>
///<reference path="SmallMouth"/>
///<reference path="EventRegistry"/>
///<reference path="SnapShot"/>
///<reference path="serverAdapters/ServerAdapter"/>
///<reference path="serverAdapters/SocketIOAdapter"/>
///<reference path="serverAdapters/SockJSAdapter"/>

module SmallMouth {

	export var SERVER_TYPES: any = {
		SOCK_JS: "SockJSAdapter",
		SOCKET_IO: "SocketIOAdapter"
	};
	
	export var serverAdapterType = SERVER_TYPES.SOCKET_IO;

	export class LargeMouthAdapter {
		
		private _callbacks: {};
		private _callbackId = 0;
		private _host: string;

		public adapter: SmallMouth.ServerAdapter;

		constructor(host: string, type: string = serverAdapterType) {

			this.adapter = new SmallMouth[type]();

			this.connect(host);
			this._host = host;
			this._callbacks = {};
		}

		private generateCallbackId() {
			return ++this._callbackId;
		}

		connect( host: string ): LargeMouthAdapter {

			this.adapter.connect(host);

			this.adapter.onMessage('set', (resp) => {
				SmallMouth.DataRegistry.getDataRegistry(this._host).serverSetData(resp.path, resp.value);

				var registryData = SmallMouth.DataRegistry.getDataRegistry(this._host).getData(resp.path);	

				SmallMouth.EventRegistry.getEventRegistry(this._host).triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(
					resp.path,
					registryData,
					host
				), {local: false});
			});

			this.adapter.onMessage('update', (resp) => {
				SmallMouth.DataRegistry.getDataRegistry(this._host).serverUpdateData(resp.path, resp.value);

				var registryData = SmallMouth.DataRegistry.getDataRegistry(this._host).getData(resp.path);	

				SmallMouth.EventRegistry.getEventRegistry(this._host).triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(
					resp.path,
					registryData,
					host
				), {local: false});
			});

			this.adapter.onMessage('remove', (resp) => {
				SmallMouth.DataRegistry.getDataRegistry(this._host).serverRemove(resp.path);

				SmallMouth.EventRegistry.getEventRegistry(this._host)
					.triggerEvent(resp.path, 'value', host, null, {local: false});

				//@todo - Add a trigger event for "remove" on parent
			});

			this.adapter.onMessage('syncComplete', (resp) => {
				this.executeCallback(resp.reqId, resp.err, resp.path, resp.data);
			});

			return this;
		}

		executeCallback(id: string, err: any, path: string, data: any) {
			if(typeof this._callbacks[id] == 'function') {
				this._callbacks[id](err);
				delete this._callbacks[id];
			}

			if(err && path) {
				SmallMouth.DataRegistry.getDataRegistry(this._host).resetData(path, data);

				SmallMouth.EventRegistry.getEventRegistry(this._host).triggerEvent(path, 'value', this._host, new SmallMouth.Snapshot(
					path,
					SmallMouth.DataRegistry.getDataRegistry(this._host).getData(path),
					this._host
				), {local: false});
			}
		}

		subscribe( path: string ): LargeMouthAdapter {
			if(!this._host) return;

			this.adapter.send('subscribe', {
				path: path,
				value: SmallMouth.DataRegistry.getDataRegistry(this._host).getData(path)
			});

			return this;
		}

		private syncRemote(method: string, path: string, data?: any, onComplete ?: (error) => any): LargeMouthAdapter {

			if(!this._host) return;

			if(typeof onComplete == 'function') {
				var callbackId = this.generateCallbackId();
				this._callbacks[callbackId] = onComplete;
			}

			this.adapter.send(method, {
				path: path,
				value: data,
				reqId: callbackId	
			});

			return this;
		}

		setRemote(data, path: string, onComplete ?: (error) => any): LargeMouthAdapter {
			return this.syncRemote('set', path, data, onComplete);
		}

		removeRemote(data, path: string, onComplete?: (error) => any): LargeMouthAdapter {
			return this.syncRemote('remove', path, null, onComplete);
		}

		generateId(): string {			
			return this.adapter.id + "-" + (new Date()).getTime();
		}
	}
}