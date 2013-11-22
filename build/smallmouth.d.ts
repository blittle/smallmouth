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
        push(value: any, complete?: (error: any) => any): ResourceInterface;
        remove(onComplete?: (error: any) => any): void;
        child(childPath: string): ResourceInterface;
        parent(): ResourceInterface;
        root(): ResourceInterface;
        name(): string;
        toString(): string;
    }
}
declare module SmallMouth {
    class Resource implements SmallMouth.ResourceInterface {
        public _path: string;
        public _host: string;
        public _largeMouthAdapter: SmallMouth.LargeMouthAdapter;
        public _dataRegistry: SmallMouth.DataRegistry;
        public _eventRegistry: SmallMouth.EventRegistry;
        constructor(address: string);
        public on(eventType: string, callback: (snapshot: SmallMouth.SnapshotInterface, previusChild?: string) => any, cancelCallback?: Function, context?: any): Resource;
        public off(eventType: string, callback?: Function, context?: any): Resource;
        public set(value: any, onComplete?: (error: any) => any): Resource;
        public update(value: any, onComplete?: (error: any) => any): Resource;
        public remove(onComplete?: (error: any) => any): void;
        public push(value: any, complete?: (error: any) => any): Resource;
        public child(childPath: string): Resource;
        public parent(): Resource;
        public root(): Resource;
        public name(): string;
        public getSocket(): any;
        public toString(): string;
        static cleanPath(_path: string): string;
        private _getSnapshot();
    }
}
declare module SmallMouth {
    var hosts: {};
    var makeConnection: (host: any) => any;
    var makeDataRegistry: (host: any, connection: any) => any;
    var makeEventRegistry: (host: any) => any;
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
        connect(host): ServerAdapter;
        onMessage(type: string, callback?: (error: any) => any): ServerAdapter;
        send(type: string, data: any, onComplete?: (error: any) => any): ServerAdapter;
    }
}
declare module SmallMouth {
    class SocketIOAdapter implements SmallMouth.ServerAdapter {
        public socket: Socket;
        public id: string;
        constructor();
        public connect(host): SocketIOAdapter;
        public onMessage(type: string, callback?: (resp: any) => any): SocketIOAdapter;
        public send(type: string, data: any, onComplete?: (error: any) => any): SocketIOAdapter;
    }
}
declare module SmallMouth {
    class SockJSAdapter implements SmallMouth.ServerAdapter {
        public socket: SockJS;
        public id: string;
        private eventListeners;
        private messageQueue;
        constructor();
        public connect(host): SockJSAdapter;
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
        constructor(host: string, type?: string);
        private generateCallbackId();
        public connect(host: string): LargeMouthAdapter;
        public executeCallback(id, err): void;
        public subscribe(path: string): LargeMouthAdapter;
        public syncRemote(data, path: string, onComplete?: (error: any) => any): LargeMouthAdapter;
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
        public remove(resource: SmallMouth.Resource, options?: any);
        public getVersions(path): any[];
        public serverUpdateData(path: string, element: any): void;
        public serverSetData(path: string, element: any): void;
        public resetRegistry(): void;
        public saveToLocalStorage(): void;
        public sync(resource: SmallMouth.Resource, onComplete?: (error: any) => any): void;
        static getDataRegistry(host: string): DataRegistry;
    }
}
