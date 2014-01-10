/// <reference path="../d.ts/DefinitelyTyped/node/node.d.ts" />
/// <reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts" />
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
        push(value: any, onComplete?: SmallMouth.onCompleteSignature): any;
        remove(onComplete?: (error: any) => any): void;
        child(childPath: string): ResourceInterface;
        parent(): ResourceInterface;
        root(): ResourceInterface;
        name(): string;
        toString(): string;
        auth(authToken: any, onSuccess?: (error: any) => any): ResourceInterface;
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
        public auth(authToken: any, onComplete?: (error: any) => any): SmallMouth.ResourceInterface;
        public unauth(): SmallMouth.ResourceInterface;
        public initializeConnection(authToken?: any, onComplete?: (error: any) => any): void;
        public authenticateConnection(type: string, options: SmallMouth.SimpleLoginOptions, onComplete: SmallMouth.onCompleteSignature): void;
        public on(eventType: string, callback: (snapshot: SmallMouth.SnapshotInterface, previusChild?: string) => any, cancelCallback?: Function, context?: any): Resource;
        public off(eventType: string, callback?: Function, context?: any): Resource;
        public set(value: any, onComplete?: (error: any) => any): Resource;
        public update(value: any, onComplete?: (error: any) => any): Resource;
        public remove(onComplete?: (error: any) => any): void;
        public push(value: any, onComplete?: SmallMouth.onCompleteSignature): any;
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
    interface SimpleLoginOptions {
        username: string;
        password: string;
        rememberMe: string;
    }
    interface SimpleLoginUser {
        email: string;
        authToken: string;
        id: string;
        md5_hash: string;
        provider: string;
        uid: string;
    }
}
declare module SmallMouth {
    interface AuthInterface {
        authToken?: string;
        type?: string;
        options?: SmallMouth.SimpleLoginOptions;
    }
}
declare module SmallMouth {
    var hosts: {};
    var defaultHost: string;
    var auth: {
        setAuthToken: (host: string, token: string) => void;
        getAuthToken: (host: string) => any;
        removeAuthToken: (host: string) => void;
    };
    interface onCompleteSignature {
        (error: any): any;
        (error: any, user: SmallMouth.SimpleLoginUser): any;
    }
    var makeConnection: (host: any, auth?: AuthInterface, onComplete?: onCompleteSignature) => any;
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
        public addEvent(path: string, type: string, callback: Function, context: any): EventRegistry;
        public removeEvent(path: string, type: string, callback: Function): any;
        public triggerEvent(path: string, type: string, host: string, snapshot: any, options?: any): EventRegistry;
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
        public version: any;
        constructor(path: any, data: any, host: any);
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
        connect(host: any, auth?: SmallMouth.AuthInterface, onSuccess?: (error: any) => any): ServerAdapter;
        onMessage(type: string, callback?: (error: any) => any): ServerAdapter;
        send(type: string, data: any, onComplete?: (error: any) => any): ServerAdapter;
        unauth(): ServerAdapter;
        isAuthenticated(): boolean;
        isConnected(): boolean;
    }
}
declare module SmallMouth {
    var SERVER_TYPES: any;
    var serverAdapterType: any;
    class LargeMouthAdapter {
        private _callbacks;
        private _callbackId;
        private _host;
        public adapter: SmallMouth.ServerAdapter;
        constructor(host: string, type?: string, auth?: SmallMouth.AuthInterface, onSuccess?: (error: any) => any);
        private generateCallbackId();
        public unauth(): LargeMouthAdapter;
        public authenticated(): boolean;
        public isConnected(): boolean;
        public connect(host: string, auth?: SmallMouth.AuthInterface, onComplete?: (error: any) => any): LargeMouthAdapter;
        public executeCallback(id: string, err: any, path: string, data: any): void;
        public subscribe(path: string): LargeMouthAdapter;
        private syncRemote(method, path, data?, onComplete?);
        public setRemote(data: any, path: string, onComplete?: (error: any) => any): LargeMouthAdapter;
        public removeRemote(data: any, path: string, onComplete?: (error: any) => any): LargeMouthAdapter;
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
        public getData(path: any, options?: any): any;
        public remove(resource: SmallMouth.Resource, options?: any): void;
        public serverRemove(path: string): void;
        public removePath(path: string): any;
        public getVersions(path: any): any[];
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
    class SimpleLogin {
        public res: SmallMouth.Resource;
        public onComplete: SmallMouth.onCompleteSignature;
        constructor(res: SmallMouth.Resource, onComplete: SmallMouth.onCompleteSignature);
        public login(type: string, options: SmallMouth.SimpleLoginOptions): SimpleLogin;
    }
}
declare module SmallMouth {
    class SocketIOAdapter implements SmallMouth.ServerAdapter {
        public socket: Socket;
        public id: string;
        private host;
        private connected;
        private authenticated;
        private needsAuth;
        private isConnecting;
        private messageQueue;
        constructor();
        public connect(host: string, auth?: SmallMouth.AuthInterface, onComplete?: (error: any) => any): SocketIOAdapter;
        public unauth(): SmallMouth.ServerAdapter;
        public isAuthenticated(): boolean;
        public onMessage(type: string, callback?: (resp: any) => any): SocketIOAdapter;
        public send(type: string, data: any, onComplete?: (error: any) => any): SocketIOAdapter;
        public isConnected(): boolean;
    }
}
