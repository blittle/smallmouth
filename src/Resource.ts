///<reference path="interfaces/ResourceInterface"/>
///<reference path="interfaces/SnapshotInterface"/>
///<reference path="LargeMouthAdapter"/>
///<reference path="DataRegistry"/>

module SmallMouth {	

	var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');

	export class Resource implements SmallMouth.ResourceInterface {

		_path: string;
		_host: string;
		_largeMouthAdapter: SmallMouth.LargeMouthAdapter;
		_dataRegistry: SmallMouth.DataRegistry;
		_eventRegistry: SmallMouth.EventRegistry;
		_subscribed = false;

		constructor(address: string) {
			var parse = urlReg.exec(address),
				scheme = parse[1],
				domain = parse[3],
				path = parse[5],
				query = parse[6],
				host = (scheme ? scheme : "") + (domain ? domain : ""),
				path = Resource.cleanPath((path ? path : "") + (query ? query : "")),
				scope = this;	

			host = host ? host : SmallMouth.defaultHost;
			
			this._path = path;
			this._host = host;

			this._eventRegistry = SmallMouth.makeEventRegistry(this._host);
		}

		auth( authToken, onComplete ?: (error) => any ): ResourceInterface {
			this.initializeConnection(authToken, onComplete);
			return this;
		}

		unauth(): ResourceInterface {
			this._largeMouthAdapter.unauth();
			return this;
		}

		initializeConnection(authToken?: any, onComplete?: (error) => any ) {
			if(!this._largeMouthAdapter) {
				this._largeMouthAdapter = SmallMouth.makeConnection(this._host, {
					authToken: authToken
				}, onComplete);
			}

			if(!this._dataRegistry) {
				this._dataRegistry = SmallMouth.makeDataRegistry(this._host, this._largeMouthAdapter);
				this._dataRegistry.initializeResource(this);
			}
		}

		authenticateConnection(
			type: string, 
			options: SmallMouth.SimpleLoginOptions, 
			onComplete: SmallMouth.onCompleteSignature
		) {
			if(!this._largeMouthAdapter) {
				this._largeMouthAdapter = SmallMouth.makeConnection(this._host, {
					type: type,
					options: options
				}, onComplete);
			}

			if(!this._dataRegistry) {
				this._dataRegistry = SmallMouth.makeDataRegistry(this._host, this._largeMouthAdapter);
				this._dataRegistry.initializeResource(this);
			}
		}

		on(
			eventType: string, 
			callback: (snapshot: SmallMouth.SnapshotInterface, previusChild ?: string) => any, 
			cancelCallback ?: Function, 
			context?: any
		): Resource {

			this.initializeConnection();

			if(!this._subscribed) {
				this._largeMouthAdapter.subscribe(this._path);
			}

			if(typeof cancelCallback == 'function') {
				this._eventRegistry.addEvent(this._path, eventType, callback, context);	
				this._eventRegistry.addEvent(this._path, "cancel", cancelCallback, context);
				callback.call(context, this._getSnapshot(), {local: true});
			} else {
				this._eventRegistry.addEvent(this._path, eventType, callback, cancelCallback);	
				callback.call(cancelCallback, this._getSnapshot(), {local: true});
			}

			return this;
		}

		off( eventType: string, callback ?: Function, context ?: any ): Resource {
			//@todo check if there are still events in the registry, if there 
			// aren't, then we should probably kill the subscription
			this._eventRegistry.removeEvent(this._path, eventType, callback);
			return this;
		}

		set(value: any, onComplete ?: (error) => any): Resource {
			this.initializeConnection();

			if(this._largeMouthAdapter.authenticated()) {
				var changed = this._dataRegistry.updateRegistry(this, value, {onComplete: onComplete});	
				if(changed) this._eventRegistry.triggerEvent(
					this._path, 'value', this._host, this._getSnapshot(), {local: true}
				);
			} else {
				console.error('Not authenticated');
				if(typeof onComplete == 'function') onComplete.call(this, "Not authenticated");
			}
			
			return this;	
		}

		update( value: any, onComplete ?: (error) => any ): Resource {
			this.initializeConnection();

			if(this._largeMouthAdapter.authenticated()) {
				var changed = this._dataRegistry.updateRegistry(this, value, {merge: true, onComplete: onComplete});	
				if(changed) this._eventRegistry.triggerEvent(
					this._path, 'value', this._host, this._getSnapshot(), {local: true}
				);
			} else {
				console.error('Not authenticated');
				if(typeof onComplete == 'function') onComplete.call(this, "Not authenticated");
			}
			return this;
		}

		remove( onComplete?: (error) => any ): void {
			this.initializeConnection();

			if(this._largeMouthAdapter.authenticated()) {
				this._dataRegistry.remove(this, {onComplete: onComplete});
				this._eventRegistry.triggerEvent(
					this._path, 'value', this._host, this._getSnapshot(), {local: true}
				);
			} else {
				console.error('Not authenticated');
				if(typeof onComplete == 'function') onComplete.call(this, "Not authenticated");
			}
		}

		push( value: any, onComplete ?: SmallMouth.onCompleteSignature ): any {
			this.initializeConnection();

			if(this._largeMouthAdapter.authenticated()) {
				var id = this._largeMouthAdapter.generateId();
				var ref = this.child(id);

				if(typeof value !== 'undefined') {
					ref.set(value, onComplete);
				}

				return ref;
			} else {
				return console.error('Not authenticated');
				if(typeof onComplete == 'function') onComplete.call(this, "Not authenticated");
			}
		}

		child( childPath: string ): Resource {
			return new Resource(this._host + '/' + this._path + '/' + Resource.cleanPath(childPath));
		}

		parent(): Resource {
			return new Resource(this._host + '/' + this._path.substring(0, this._path.lastIndexOf('/')) );
		}

		root(): Resource {
			return new Resource(this._host + '/' + this._path.substring(0, this._path.indexOf('/')) );
		}

		name(): string {
			return this._path.substring( this._path.lastIndexOf('/') + 1 );
		}

		postMessage(key: string, data: any): Resource {
			this.initializeConnection();
			this._largeMouthAdapter.adapter.send(key, data);
			return this;
		}

		getSocket(): any {
			this.initializeConnection();
			return this._largeMouthAdapter.adapter.socket;
		}

		toString(): string {
			return this._path;
		}

		public static cleanPath(_path: string): string {
			_path = _path.charAt(0) === '/' ? _path.substring(1) : _path;
			_path = _path.charAt(_path.length - 1) === '/' ? _path.substring(0, _path.length - 1) : _path;
			return _path;
		}

		private _getSnapshot(): SmallMouth.Snapshot {

			var data = this._dataRegistry.getData(this._path);

			if(!data) return undefined;

			return new SmallMouth.Snapshot(
				this._path,
				data,
				this._host
			);		
		}
	}
}