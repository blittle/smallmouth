///<reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts"/>

module SmallMouth {

	var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');
	var connections = {};

	export class Resource {

		private _path: string;
		private attributes = {};
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

			socket.on('data', function (data) {
				if(scope._path !== data.path) return;

				scope.attributes[data.path] = data.value;
				for(var i=0, iLength = scope._callbacks.length; i < iLength; i++) {
					scope._callbacks[i].callback();
				}
			});

			socket.emit('subscribe', url);
		}

		on(eventType: string, callback: Function, context: any): Resource {
			var scope = this;

			this._callbacks.push({
				type: eventType,
				callback: function() {
					return callback.call(context, scope.attributes[scope._path]);
				}
			});

			return this;
		}

		set(value: any, onComplete: Function): Resource {
			this._socket.emit('set', {
				path: this._path,
				value: value
			});

			return this;	
		}

		private cleanPath(_path: string): string {
			_path = _path.charAt(0) === '/' ? _path.substring(1) : _path;
			return _path;
		}
	}

}