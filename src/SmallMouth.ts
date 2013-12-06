module SmallMouth {

	export var hosts = {};

	// Define a default host for all connections by default the host needs 
	// to be passed in all declarations: new SmallMouth.Resource('http://localhost:3000/path');
	// If the default host is set to a value, it allows you to simplify declarations
	// to new SmallMouth.Resource("/path");  This field is also necessary if your host constains
	// a path (separate from the data path).
	export var defaultHost = '';

	export var makeConnection = function(host) {
		if(!hosts[host]) hosts[host] = {};
		if(hosts[host].connection) return hosts[host].connection;		
		return hosts[host].connection = new SmallMouth.LargeMouthAdapter(host);
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
		SmallMouth.makeConnection(host).adapter.send(key, data);
	}

	export function getAvailableAdapters() {
		return Object.keys(SmallMouth.SERVER_TYPES);
	}

	export function setSocketAdapter(adapter: string) {
		SmallMouth.serverAdapterType = SmallMouth.SERVER_TYPES[adapter];
	}
}