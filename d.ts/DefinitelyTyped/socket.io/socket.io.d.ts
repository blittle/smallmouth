// Type definitions for socket.io
// Project: http://socket.io/
// Definitions by: William Orr <https://github.com/worr>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare var io: SocketManager;

interface Socket {
	json:any;
	log: any;
	volatile: any;
	broadcast: any;
	id: string;
	in(room: string): Socket;
	to(room: string): Socket;
	join(name: string, fn: Function): Socket;
	unjoin(name: string, fn: Function): Socket;
	set(key: string, value: any, fn: Function): Socket;
	get(key: string, fn: Function): Socket;
	has(key: string, fn: Function): Socket;
	del(key: string, fn: Function): Socket;
	disconnect(): Socket;
	send(data: any, fn: Function): Socket;
	emit(ev: any, ...data:any[]): Socket;
	on(ns: string, fn: Function): Socket;
}

interface SocketNamespace {
	clients(room: string): Socket[];
	log: any;
	store: any;
	json: any;
	volatile: any;
	in(room: string): SocketNamespace;
	on(evt: string, fn: (socket: Socket) => void): SocketNamespace;
	to(room: string): SocketNamespace;
	except(id: any): SocketNamespace;
	send(data: any): any;
	emit(ev: any, ...data:any[]): Socket;
	socket(sid: any, readable: boolean): Socket;
	authorization(fn: Function);
}

interface SocketManager {
	connect: (host: string, options?: any)=>Socket;
}
