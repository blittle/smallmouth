module SmallMouth {
	export interface ServerAdapter {
		socket: any;
		id: string;
		connect(host, authToken?: any, onSuccess?: (error) => any): ServerAdapter;
		onMessage(type: string, callback ?: (error) => any): ServerAdapter;
		send(type: string, data: any, onComplete ?: (error) => any): ServerAdapter;
		unauth(): ServerAdapter;
		authenticated(): boolean;
		isConnected(): boolean;
	}
}