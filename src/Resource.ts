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

		constructor(address: string) {
			var parse = urlReg.exec(address),
			scheme = parse[1],
			domain = parse[3],
			path = parse[5],
			query = parse[6],
			host = (scheme ? scheme : "") + (domain ? domain : ""),
			path = Resource.cleanPath((path ? path : "") + (query ? query : "")),
			scope = this;	

			this._path = path;
			this._host = host;

			this._eventRegistry = SmallMouth.makeEventRegistry(host);

			this._largeMouthAdapter = SmallMouth.makeConnection(host);
			this._dataRegistry = SmallMouth.makeDataRegistry(host, this._largeMouthAdapter);

			var data = this._dataRegistry.initializeResource(this);
			this._largeMouthAdapter.subscribe(path);
		}

		on(
			eventType: string, 
			callback: (snapshot: SmallMouth.SnapshotInterface, previusChild ?: string) => any, 
			cancelCallback ?: Function, 
			context?: any
		): Resource {

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
			this._eventRegistry.removeEvent(this._path, eventType, callback);
			return this;
		}

		set(value: any, onComplete ?: (error) => any): Resource {
			var changed = this._dataRegistry.updateRegistry(this, value, {onComplete: onComplete});	
			if(changed) this._eventRegistry.triggerEvent(
				this._path, 'value', this._host, this._getSnapshot(), {local: true}
			);
			return this;	
		}

		update( value: any, onComplete ?: (error) => any ): Resource {
			var changed = this._dataRegistry.updateRegistry(this, value, {merge: true, onComplete: onComplete});	
			if(changed) this._eventRegistry.triggerEvent(
				this._path, 'value', this._host, this._getSnapshot(), {local: true}
			);
			return this;
		}

		remove( onComplete?: (error) => any ): void {
			this._dataRegistry.remove(this, {onComplete: onComplete});
			this._eventRegistry.triggerEvent(
				this._path, 'value', this._host, this._getSnapshot(), {local: true}
			);
		}

		push( value: any, complete ?: (error) => any ): Resource {
			var id = this._largeMouthAdapter.generateId();
			var ref = this.child(id);

			if(typeof value !== 'undefined') {
				ref.set(value);
			}

			return ref;
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

		getSocket(): any {
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