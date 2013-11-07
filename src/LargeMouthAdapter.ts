///<reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts"/>

module SmallMouth.largeMouthAdapter {

	var callbackId = 0;

	var connections = {};

	var callbacks = {};	

	function connect(host) {
		var socket;
		if(!host) return;

		if(connections[host]) {
			socket = connections[host];

			// If we already have a connection, we don't need to add events to the socket
			return socket;
		} else {
			socket = connections[host] = io.connect(host);
		}

		socket.on('set', (resp) => {
			SmallMouth._dataRegistry.serverSetData(resp.path, resp.value);

			var registryData = SmallMouth._dataRegistry.getData(resp.path);	

			SmallMouth._eventRegistry.triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(
				resp.path,
				registryData,
				host
			), {remote: true});
		});

		socket.on('update', (resp) => {
			SmallMouth._dataRegistry.serverUpdateData(resp.path, resp.value);

			var registryData = SmallMouth._dataRegistry.getData(resp.path);	

			SmallMouth._eventRegistry.triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(
				resp.path,
				registryData,
				host
			), {remote: true});
		});

		socket.on('syncComplete', (resp) => {
			executeCallback(resp.reqId, resp.err);
		});

		socket.on('ready', (resp) => {
			connections[host].id = resp.id;
		});

		return socket;
	}


	function subscribe(host, url) {
		var socket = connections[host];
		if(!socket) return;

		socket.emit('subscribe', {
			url: url,
			value: SmallMouth._dataRegistry.getData(url)
		});
	}

	function syncRemote(host, data, url, onComplete ?: (error) => any) {
		var socket = connections[host];
		if(!socket) return;

		if(typeof onComplete == 'function') {
			var callbackId = generateCallbackId();
			callbacks[callbackId] = onComplete;
		}

		socket.emit('set', {
			url: url,
			value: data,
			reqId: callbackId	
		});
	}

	function executeCallback(id, err) {
		if(typeof callbacks[id] == 'function') {
			callbacks[id](err);
			delete callbacks[id];
		}
	}

	function generateId(host?: string) {
		var id = (new Date()).getTime() + "";
		if(host) id = connections[host].id + '-' + id;
		return id;
	}

	function generateCallbackId() {
		return ++callbackId;
	}

	export var connect = connect;
	export var subscribe = subscribe;
	export var syncRemote = syncRemote;
	export var generateId = generateId;
}