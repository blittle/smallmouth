///<reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts"/>

module SmallMouth.largeMouthAdapter {

	var connections = {};	

	function connect(host) {
		var socket;
		if(!host) return;

		if(connections[host]) {
			socket = connections[host];
		} else {
			socket = connections[host] = io.connect(host);
		}

		socket.on('data', (data) => {
			SmallMouth._dataRegistry.updateRegistry(data.path, data.value);

			var registryData = SmallMouth._dataRegistry.getData(data.path);	

			SmallMouth._eventRegistry.triggerEvent(data.path, 'value', host, new SmallMouth.Snapshot(
				data.path,
				registryData,
				host
			));
		});

		return socket;
	}

	export var connect = connect;
}