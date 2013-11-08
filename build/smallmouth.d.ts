/// <reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts" />
declare module SmallMouth {
    interface ServerAdapter {
        connect(host: string): ServerAdapter;
        subscribe(url: string): ServerAdapter;
        syncRemote(data, url: string, onComplete?: (error: any) => any): ServerAdapter;
        generateId(): string;
    }
}
declare module SmallMouth {
    class DataRegistry {
        private _dataRegistry;
        private _host;
        private _serverAdapter;
        constructor(host: string, serverAdapter: SmallMouth.ServerAdapter);
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
declare module SmallMouth._eventRegistry {
    var addEvent: (path: string, type: string, callback: Function, context: any) => void;
    var removeEvent: (path: string, type: string, callback: Function) => number;
    var triggerEvent: (path: string, type: string, host: string, snapshot: any, options?: any) => void;
    var resetRegistry: () => void;
    var eventRegistry: {
        events: {};
        children: {};
    };
}
declare module SmallMouth {
    class LargeMouthAdapter implements SmallMouth.ServerAdapter {
        private _socket;
        private _callbacks;
        private _callbackId;
        private _host;
        constructor(host: string);
        private generateCallbackId();
        public connect(host: string): LargeMouthAdapter;
        public executeCallback(id, err): void;
        public subscribe(url: string): LargeMouthAdapter;
        public syncRemote(data, url: string, onComplete?: (error: any) => any): LargeMouthAdapter;
        public generateId(): string;
    }
}
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
        public _serverAdapter: SmallMouth.ServerAdapter;
        public _dataRegistry: SmallMouth.DataRegistry;
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
        public toString(): string;
        static cleanPath(_path: string): string;
        private _getSnapshot();
    }
}
declare module SmallMouth {
    var hosts: {};
    var makeConnection: (host: any) => LargeMouthAdapter;
    var makeDataRegistry: (host: any, connection: any) => DataRegistry;
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
