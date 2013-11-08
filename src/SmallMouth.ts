module SmallMouth {

	export var hosts = {};

	export var makeConnection = function(host) {
		if(!hosts[host]) hosts[host] = {};
		return hosts[host].connection || hosts[host].connection = new SmallMouth.LargeMouthAdapter(host);
	}

	export var makeDataRegistry = function(host, connection) {
		if(!hosts[host]) hosts[host] = {};
		return hosts[host].data || hosts[host].data = new SmallMouth.DataRegistry(host, connection);
	}
}