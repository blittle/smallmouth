///<reference path="interfaces/SmallMouthInterface"/>
///<reference path="interfaces/SnapshotInterface"/>
///<reference path="DataRegistry"/>

module SmallMouth {	

	var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');

	export class Resource implements SmallMouth.SmallMouthInterface {

		private _path: string;
		private _host: string;

		constructor(address: string) {
			var parse = urlReg.exec(address),
			scheme = parse[1],
			domain = parse[3],
			path = parse[5],
			query = parse[6],
			host = (scheme ? scheme : "") + (domain ? domain : ""),
			url = Resource.cleanPath((path ? path : "") + (query ? query : "")),
			scope = this;	

			this._path = url;
			this._host = host;

			SmallMouth._dataRegistry.initializeRegistry(this);

			var socket = SmallMouth.largeMouthAdapter.connect(host);

			if(socket) {
				socket.emit('subscribe', url);
			}
		}

		on(
			eventType: string, 
			callback: (snapshot: SmallMouth.SnapshotInterface, previusChild ?: string) => any, 
			cancelCallback ?: Function, 
			context?: any
		): Resource {

			if(typeof cancelCallback == 'function') {
				SmallMouth._eventRegistry.addEvent(this._path, eventType, callback, context);	
				SmallMouth._eventRegistry.addEvent(this._path, "cancel", cancelCallback, context);
			} else {
				SmallMouth._eventRegistry.addEvent(this._path, eventType, callback, cancelCallback);	
			}

			return this;
		}

		off( eventType: string, callback ?: Function, context ?: any ): Resource {
			SmallMouth._eventRegistry.removeEvent(this._path, eventType, callback);
			return this;
		}

		set(value: any, onComplete ?: (error) => any): Resource {
			SmallMouth._dataRegistry.updateRegistry(this._path, value);	
			SmallMouth._eventRegistry.triggerEvent(this._path, 'value', this._host, this._getSnapshot());
			return this;	
		}

		update( value: any, onComplete ?: (error) => any ): Resource {
			SmallMouth._dataRegistry.updateRegistry(this._path, value, {merge: true});	
			SmallMouth._eventRegistry.triggerEvent(this._path, 'value', this._host, this._getSnapshot());
			return this;
		}

		remove( onComplete?: (error) => any ): void {
			SmallMouth._dataRegistry.remove(this._path);
			SmallMouth._eventRegistry.triggerEvent(this._path, 'value', this._host, this._getSnapshot());
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

		toString(): string {
			return this._path;
		}

		public static cleanPath(_path: string): string {
			_path = _path.charAt(0) === '/' ? _path.substring(1) : _path;
			_path = _path.charAt(_path.length - 1) === '/' ? _path.substring(0, _path.length - 1) : _path;
			return _path;
		}

		private _getSnapshot(): SmallMouth.Snapshot {

			var data = SmallMouth._dataRegistry.getData(this._path);

			if(!data) return undefined;

			return new SmallMouth.Snapshot(
				this._path,
				data,
				this._host
			);		
		}
	}
}