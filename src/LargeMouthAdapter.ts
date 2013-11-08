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

	export class LargeMouthAdapter {
		
		private _callbacks: {};
		private _callbackId = 0;
		private _host: string;

		private _adapter: SmallMouth.ServerAdapter;

		constructor(host: string, type: string = "SocketIOAdapter") {

			this._adapter = new SmallMouth[type]();

			this.connect(host);
			this._host = host;
			this._callbacks = {};
		}

		private generateCallbackId() {
			return ++this._callbackId;
		}

		connect( host: string ): LargeMouthAdapter {

			this._adapter.connect(host);

			this._adapter.onMessage('set', (resp) => {
				SmallMouth.DataRegistry.getDataRegistry(this._host).serverSetData(resp.path, resp.value);

				var registryData = SmallMouth.DataRegistry.getDataRegistry(this._host).getData(resp.path);	

				SmallMouth._eventRegistry.triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(
					resp.path,
					registryData,
					host
				), {remote: true});
			});

			this._adapter.onMessage('update', (resp) => {
				SmallMouth.DataRegistry.getDataRegistry(this._host).serverUpdateData(resp.path, resp.value);

				var registryData = SmallMouth.DataRegistry.getDataRegistry(this._host).getData(resp.path);	

				SmallMouth._eventRegistry.triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(
					resp.path,
					registryData,
					host
				), {remote: true});
			});

			this._adapter.onMessage('syncComplete', (resp) => {
				this.executeCallback(resp.reqId, resp.err);
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
			if(!this._host) return;

			this._adapter.send('subscribe', {
				url: url,
				value: SmallMouth.DataRegistry.getDataRegistry(this._host).getData(url)
			});

			return this;
		}

		syncRemote(data, url: string, onComplete ?: (error) => any): LargeMouthAdapter {

			if(!this._host) return;

			if(typeof onComplete == 'function') {
				var callbackId = this.generateCallbackId();
				this._callbacks[callbackId] = onComplete;
			}

			this._adapter.send('set', {
				url: url,
				value: data,
				reqId: callbackId	
			});

			return this;
		}

		generateId(): string {			
			return this._adapter.id + "-" + (new Date()).getTime();
		}
	}
}