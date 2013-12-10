/// <reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts" />
/// <reference path="../d.ts/DefinitelyTyped/sockjs/sockjs.d.ts" />
declare module SmallMouth {
    interface SnapshotInterface {
        val(): any;
        child(path: string): SnapshotInterface;
        forEach(childAction: (childSnapshot: SnapshotInterface) => any): boolean;
        hasChild(childPath: string): boolean;
        hasChildren(): boolean;
        name(): string;
        numChildren(): number;
        ref(): SmallMouth.ResourceInterface;
    }
}
declare module SmallMouth {
    interface ServerValueInterface {
        TIMESTAMP: number;
    }
}
declare module SmallMouth {
    interface ResourceInterface {
        on(eventType: string, callback: (snapshot: SmallMouth.SnapshotInterface, previusChild?: string) => any, cancelCallbck?: Function, context?: any): ResourceInterface;
        on(eventType: string, callback: (snapshot: SmallMouth.SnapshotInterface, previusChild?: string) => any, context?: any): ResourceInterface;
        off(eventType: string, callback?: Function, context?: any): ResourceInterface;
        set(value: any, onComplete?: (error: any) => any): ResourceInterface;
        update(value: any, onComplete?: (error: any) => any): ResourceInterface;
        push(value: any, complete?: (error: any) => any): any;
        remove(onComplete?: (error: any) => any): void;
        child(childPath: string): ResourceInterface;
        parent(): ResourceInterface;
        root(): ResourceInterface;
        name(): string;
        toString(): string;
        auth(authToken, onSuccess?: (error: any) => any): ResourceInterface;
        unauth(): ResourceInterface;
    }
}
declare module SmallMouth {
    class Resource implements SmallMouth.ResourceInterface {
        public _path: string;
        public _host: string;
        public _largeMouthAdapter: SmallMouth.LargeMouthAdapter;
        public _dataRegistry: SmallMouth.DataRegistry;
        public _eventRegistry: SmallMouth.EventRegistry;
        public _subscribed: boolean;
        constructor(address: string);
        public auth(authToken, onComplete?: (error: any) => any): SmallMouth.ResourceInterface;
        public unauth(): SmallMouth.ResourceInterface;
        public initializeConnection(authToken?: any, onComplete?: (error: any) => any): void;
        public on(eventType: string, callback: (snapshot: SmallMouth.SnapshotInterface, previusChild?: string) => any, cancelCallback?: Function, context?: any): Resource;
        public off(eventType: string, callback?: Function, context?: any): Resource;
        public set(value: any, onComplete?: (error: any) => any): Resource;
        public update(value: any, onComplete?: (error: any) => any): Resource;
        public remove(onComplete?: (error: any) => any): void;
        public push(value: any, onComplete?: (error: any) => any): {};
        public child(childPath: string): Resource;
        public parent(): Resource;
        public root(): Resource;
        public name(): string;
        public postMessage(key: string, data: any): Resource;
        public getSocket(): any;
        public toString(): string;
        static cleanPath(_path: string): string;
        private _getSnapshot();
    }
}
declare module SmallMouth {
    var hosts: {};
    var defaultHost: string;
    var makeConnection: (host: any, authToken?: any, onComplete?: (error: any) => any) => any;
    var makeDataRegistry: (host: any, connection: any) => any;
    var makeEventRegistry: (host: any) => any;
    function postMessage(host: string, key: string, data: any): void;
    function getAvailableAdapters(): string[];
    function setSocketAdapter(adapter: string): void;
}
declare module SmallMouth {
    class EventRegistry {
        private eventRegistry;
        private _host;
        constructor(host: string);
        public addEvent(path: string, type: string, callback: Function, context): EventRegistry;
        public removeEvent(path: string, type: string, callback: Function): any;
        public triggerEvent(path: string, type: string, host: string, snapshot, options?: any): EventRegistry;
        public resetRegistry(): EventRegistry;
        private getEvent(path, options?);
        static getEventRegistry(host: string): EventRegistry;
    }
}
declare module SmallMouth {
    class Snapshot implements SmallMouth.SnapshotInterface {
        private _path;
        private _data;
        private _host;
        public version;
        constructor(path, data, host);
        public val(): any;
        public child(path: string): Snapshot;
        public forEach(childAction: (childSnapshot: SmallMouth.SnapshotInterface) => any): boolean;
        public hasChild(childPath: string): boolean;
        public hasChildren(): boolean;
        public name(): string;
        public numChildren(): number;
        public ref(): SmallMouth.Resource;
    }
}
declare module SmallMouth {
    interface ServerAdapter {
        socket: any;
        id: string;
        connect(host, authToken?: any, onSuccess?: (error: any) => any): ServerAdapter;
        onMessage(type: string, callback?: (error: any) => any): ServerAdapter;
        send(type: string, data: any, onComplete?: (error: any) => any): ServerAdapter;
        unauth(): ServerAdapter;
        authenticated(): boolean;
    }
}
declare module SmallMouth {
    class SocketIOAdapter implements SmallMouth.ServerAdapter {
        public socket: Socket;
        public id: string;
        private connected;
        private isAuthenticated;
        private needsAuth;
        constructor();
        public connect(host, authToken?: any, onComplete?: (error: any) => any): SocketIOAdapter;
        public unauth(): SmallMouth.ServerAdapter;
        public authenticated(): boolean;
        public onMessage(type: string, callback?: (resp: any) => any): SocketIOAdapter;
        public send(type: string, data: any, onComplete?: (error: any) => any): SocketIOAdapter;
        public isConnected(): boolean;
    }
}
declare module SmallMouth {
    class SockJSAdapter implements SmallMouth.ServerAdapter {
        public socket: SockJS;
        public id: string;
        private eventListeners;
        private messageQueue;
        constructor();
        public connect(host, authToken?: any, onComplete?: (error: any) => any): SockJSAdapter;
        public unauth(): SmallMouth.ServerAdapter;
        public authenticated(): boolean;
        public onMessage(type: string, callback?: (resp: any) => any): SockJSAdapter;
        public send(type: string, data: any, onComplete?: (error: any) => any): SockJSAdapter;
    }
}
declare module SmallMouth {
    var SERVER_TYPES: any;
    var serverAdapterType;
    class LargeMouthAdapter {
        private _callbacks;
        private _callbackId;
        private _host;
        public adapter: SmallMouth.ServerAdapter;
        constructor(host: string, type?: string, authToken?: any, onSuccess?: (error: any) => any);
        private generateCallbackId();
        public unauth(): LargeMouthAdapter;
        public authenticated(): boolean;
        public connect(host: string, authToken?: any, onComplete?: (error: any) => any): LargeMouthAdapter;
        public executeCallback(id: string, err: any, path: string, data: any): void;
        public subscribe(path: string): LargeMouthAdapter;
        private syncRemote(method, path, data?, onComplete?);
        public setRemote(data, path: string, onComplete?: (error: any) => any): LargeMouthAdapter;
        public removeRemote(data, path: string, onComplete?: (error: any) => any): LargeMouthAdapter;
        public generateId(): string;
    }
}
declare module SmallMouth {
    class DataRegistry {
        private _dataRegistry;
        private _host;
        private _largeMouthAdapter;
        constructor(host: string, largeMouthAdapter: SmallMouth.LargeMouthAdapter);
        public initializeResource(resource: SmallMouth.Resource): DataRegistry;
        public updateRegistry(resource: SmallMouth.Resource, value: any, options?: any): boolean;
        public getData(path, options?: any);
        public remove(resource: SmallMouth.Resource, options?: any): void;
        public serverRemove(path: string): void;
        public removePath(path: string);
        public getVersions(path): any[];
        public resetData(path: string, element: any): void;
        public serverUpdateData(path: string, element: any): void;
        public serverSetData(path: string, element: any): void;
        public resetRegistry(): void;
        public saveToLocalStorage(): void;
        public persistSet(resource: SmallMouth.Resource, onComplete?: (error: any) => any): void;
        public persistRemove(resource: SmallMouth.Resource, onComplete?: (error: any) => any): void;
        public persist(method: string, path: string, data: any, onComplete?: (error: any) => any): void;
        static getDataRegistry(host: string): DataRegistry;
    }
}
declare module SmallMouth {
    interface WebSocket {
        new(url: string, subprotocols?: string[]): WebSocket;
        readyState: number;
        send(data: any): any;
        onmessage: Function;
        onopen: Function;
    }
    class NativeAdapter implements SmallMouth.ServerAdapter {
        public socket: WebSocket;
        public id: string;
        private eventListeners;
        private messageQueue;
        constructor();
        public unauth(): SmallMouth.ServerAdapter;
        public authenticated(): boolean;
        public connect(host, authToken?: any, onComplete?: (error: any) => any): NativeAdapter;
        public onMessage(type: string, callback?: (resp: any) => any): NativeAdapter;
        public send(type: string, data: any, onComplete?: (error: any) => any): NativeAdapter;
    }
}
