!function(global) {
	var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');

	var connections = {};

	var SmallMouth = function(address) {

		var parse = urlReg.exec(address),
			scheme = parse[1],
			domain = parse[3],
			path = parse[5],
			query = parse[6],
			host = (scheme ? scheme : "") + (domain ? domain : ""),
			url = (path ? path : "") + (query ? query : ""),
			socket = connections[host],
			scope = this;

		this._path = url;

		this.attributes = {};
		this._callbacks = [];

		this._socket = socket ? socket : (socket = connections[host] = io.connect(host));

		socket.on('data', function (data) {
			if(scope._path !== data.path) return;

			scope.attributes[data.path] = data.value;
			for(var i=0, iLength = scope._callbacks.length; i < iLength; i++) {
				scope._callbacks[i]();
			}
		});

		socket.emit('subscribe', url);
	};

	SmallMouth.prototype.on = function(eventType, callback, context) {
		var scope = this;

		this._callbacks.push(function() {
			return callback.call(context, scope.attributes[scope._path]);
		});

		return this;
	};

	SmallMouth.prototype.set = function(value, onComplete) {
		this._socket.emit('set', {
			path: this._path,
			value: value
		});

		return this;
	};

	window.SmallMouth = SmallMouth;

}(window);