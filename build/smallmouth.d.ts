/// <reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts" />
declare module SmallMouth._dataRegistry {
    var initializeRegistry: (resource: SmallMouth.Resource) => any;
    var updateRegistry: (resource: SmallMouth.Resource, value: any, options?: any) => boolean;
    var getData: (path: any, options?: any) => any;
    var dataRegistry;
    var resetRegistry: () => void;
    var remove: (resource: SmallMouth.Resource) => any;
    var getVersions: (path: any) => any[];
    var serverUpdateData: (path: string, element: any) => void;
    var serverSetData: (path: string, element: any) => void;
}
declare module SmallMouth._eventRegistry {
    var addEvent: (path: string, type: string, callback: Function, context: any) => void;
    var removeEvent: (path: string, type: string, callback: Function) => void;
    var triggerEvent: (path: string, type: string, host: string, snapshot: any, options?: any) => void;
    var resetRegistry: () => void;
    var eventRegistry: {
        events: {};
        children: {};
    };
}
declare module SmallMouth.largeMouthAdapter {
    var connect: (host: any) => any;
    var subscribe: (host: any, url: any) => void;
    var syncRemote: (host: any, data: any, url: any) => void;
    var generateId: (host?: string) => string;
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
