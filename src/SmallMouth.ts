module SmallMouth {

	export var hosts = {};

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
}