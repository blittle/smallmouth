///<reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts"/>
///<reference path="interfaces/SmallMouthInterface"/>
///<reference path="interfaces/SnapShotInterface"/>
///<reference path="DataRegistry"/>

module SmallMouth {	

	var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');
	var connections = {};	

	export class Resource implements SmallMouth.SmallMouthInterface {

		private _path: string;
		private _callbacks = [];
		private _socket: Socket;
		private _host: string;

		constructor(address: string) {
			var parse = urlReg.exec(address),
			scheme = parse[1],
			domain = parse[3],
			path = parse[5],
			query = parse[6],
			host = (scheme ? scheme : "") + (domain ? domain : ""),
			url = this.cleanPath((path ? path : "") + (query ? query : "")),
			socket = connections[host],
			scope = this;	

			this._path = url;
			this._host = host;
			this._socket = socket ? socket : (socket = connections[host] = io.connect(host));

			// socket.on('data', function (data) {
			// 	if(scope._path !== data.path) return;

			// 	scope.data = data.value;
			// 	for(var i=0, iLength = scope._callbacks.length; i < iLength; i++) {
			// 		scope._callbacks[i].callback();
			// 	}
			// });

			// socket.emit('subscribe', url);

			SmallMouth._registry.initializeRegistry(this);
		}

		on(
			eventType: string, 
			callback: (snapshot: SmallMouth.SnapShotInterface, previusChild ?: string) => any, 
			cancelCallbck ?: Function, 
			context?: any
		): Resource {
			var scope = this;

			this._callbacks.push({
				type: eventType,
				callback: () => {
					//@todo change null to actually be the snapshot
					return callback.call(context, null);
				}
			});

			return this;
		}

		set(value: any, onComplete ?: (error) => any): Resource {
			SmallMouth._registry.updateRegistry(this, value);	

			// this._socket.emit('set', {
			// 	path: this._path,
			// 	value: value
			// });

			return this;	
		}

		update( value: any, onComplete ?: (error) => any ): SmallMouthInterface {
			SmallMouth._registry.updateRegistry(this, value, {merge: true});	
			return this;
		}

		child( childPath: string ): Resource {
			return new Resource(this._host + '/' + this._path + '/' + this.cleanPath(childPath));
		}

		parent(): Resource {
			return new Resource(this._host + '/' + this._path.substring(0, this._path.lastIndexOf('/')) );
		}

		root(): SmallMouthInterface {
			return new Resource(this._host + '/' + this._path.substring(0, this._path.indexOf('/')) );
		}

		name(): string {
			return this._path.substring( this._path.lastIndexOf('/') + 1 );
		}

		toString(): string {
			return this._path;
		}

		private cleanPath(_path: string): string {
			_path = _path.charAt(0) === '/' ? _path.substring(1) : _path;
			_path = _path.charAt(_path.length - 1) === '/' ? _path.substring(0, _path.length - 1) : _path;
			return _path;
		}

		private _getSnapshot() {
			return SmallMouth._registry.getData(this._path);	
		}
	}
}