///<reference path="../d.ts/DefinitelyTyped/node/node.d.ts"/>

module SmallMouth {

	export var hosts = {};

	// Define a default host for all connections by default the host needs 
	// to be passed in all declarations: new SmallMouth.Resource('http://localhost:3000/path');
	// If the default host is set to a value, it allows you to simplify declarations
	// to new SmallMouth.Resource("/path");  This field is also necessary if your host constains
	// a path (separate from the data path).
	export var defaultHost = '';

	export var makeConnection = function(host, authToken?: any, onComplete?: (error) => any) {
		if(!hosts[host]) hosts[host] = {};

		if(
			hosts[host].connection
		) {
			var connection = hosts[host].connection;

			if(!connection.authenticated() ||  !connection.isConnected()) {
				connection.connect(host, authToken, onComplete);
			}

			return connection;
		}

		return hosts[host].connection = new SmallMouth.LargeMouthAdapter(
			host, undefined, authToken, onComplete
		);
	}

	export var makeDataRegistry = function(host, connection) {
		if(!hosts[host]) hosts[host] = {};
		if(hosts[host].data) return hosts[host].data;
		return  hosts[host].data = new SmallMouth.DataRegistry(host, connection);
	}

	export var makeEventRegistry = function(host) {
		if(!hosts[host]) hosts[host] = {};
		if(hosts[host].eventRegistry) return hosts[host].eventRegistry;
		return hosts[host].eventRegistry = new SmallMouth.EventRegistry(host);
	}

	export function postMessage(host: string, key: string, data: any) {
		SmallMouth.makeConnection(host)
			.adapter.send(key, data);
	}

	export function getAvailableAdapters() {
		return Object.keys(SmallMouth.SERVER_TYPES);
	}

	export function setSocketAdapter(adapter: string) {
		SmallMouth.serverAdapterType = SmallMouth.SERVER_TYPES[adapter];
	}

	if (typeof exports === 'object') {
		module.exports = SmallMouth;
	}
}