///<reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts"/>

module SmallMouth {

	var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');
	var connections = {};	
	var dataRegistry = JSON.parse(localStorage.getItem('LargeMouth_Registry')) || {
		data: null,
		children: {},
		version: 0
	};

	var syncTimeout;

	function getData(path, options?: any) {
		if(!options) options = {};

		var paths = path.split('/');
		var data = dataRegistry;
		
		for(var i=0, iLength = paths.length; i < iLength; i++) {
			if(!data.children[paths[i]]) {
				data.children[paths[i]] = {
					children: {},
					version: 0
				} 
			} 

			if(options.versionUpdate) data.version++;

			data = data.children[paths[i]];
		}

		return data;
	}

	function updateRegistry(resource, value) {
		var data = getData(resource._path, {versionUpdate: true});
		data.data = value;
		data.version++;

		sync(resource);
	}

	function initializeRegistry(resource) {
		var data = getData(resource._path);
		resource.data = data.data;

		sync(resource);		
	}

	function sync(resource) {
		if(syncTimeout) clearTimeout(syncTimeout);

		syncTimeout = setTimeout(()=> {
			localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
		}, 100);
	}

	export var dataRegistry = dataRegistry;

	export function resetRegistry() {
		dataRegistry.data = null;
		dataRegistry.children = {};
		dataRegistry.version = 0;

		localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
	}

	export class Resource {

		private _path: string;
		private _callbacks = [];
		private _socket: Socket;

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
			this._socket = socket ? socket : (socket = connections[host] = io.connect(host));

			// socket.on('data', function (data) {
			// 	if(scope._path !== data.path) return;

			// 	scope.data = data.value;
			// 	for(var i=0, iLength = scope._callbacks.length; i < iLength; i++) {
			// 		scope._callbacks[i].callback();
			// 	}
			// });

			// socket.emit('subscribe', url);

			initializeRegistry(this);
		}

		on(eventType: string, callback: Function, context: any): Resource {
			var scope = this;

			this._callbacks.push({
				type: eventType,
				callback: () => {
					return callback.call(context, this._getSnapshot());
				}
			});

			return this;
		}

		set(value: any, onComplete: Function): Resource {
			updateRegistry(this, value);	

			// this._socket.emit('set', {
			// 	path: this._path,
			// 	value: value
			// });

			return this;	
		}

		private cleanPath(_path: string): string {
			_path = _path.charAt(0) === '/' ? _path.substring(1) : _path;
			return _path;
		}

		private _getSnapshot() {
			return getData(this._path);	
		}
	}
}