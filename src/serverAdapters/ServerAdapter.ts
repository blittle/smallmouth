///<reference path="../interfaces/AuthInterface"/>

module SmallMouth {
	export interface ServerAdapter {
		socket: any;
		id: string;
		connect(host, auth?: SmallMouth.AuthInterface, onSuccess?: (error) => any): ServerAdapter;
		onMessage(type: string, callback ?: (error) => any): ServerAdapter;
		send(type: string, data: any, onComplete ?: (error) => any): ServerAdapter;
		unauth(): ServerAdapter;
		isAuthenticated(): boolean;
		isConnected(): boolean;
	}
}