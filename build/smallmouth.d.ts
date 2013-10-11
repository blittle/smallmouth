/// <reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts" />
declare module SmallMouth {
    var _registry: {
        connect: (host: any) => any;
        initializeRegistry: (resource: any) => void;
        updateRegistry: (path: any, value: any, options?: any) => void;
        getData: (path: any, options?: any) => any;
        dataRegistry: any;
        eventRegistry: {
            events: {};
            children: {};
        };
        resetRegistries: () => void;
        remove: (path: any) => any;
        addEvent: (path: string, type: string, callback: Function, context: any) => void;
        removeEvent: (path: string, type: string, callback: Function) => void;
        triggerEvent: (path: string, type: string, host: string, snapshot: any) => void;
    };
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
        ref(): SmallMouth.SmallMouthInterface;
    }
}
declare module SmallMouth {
    interface ServerValueInterface {
        TIMESTAMP: number;
    }
}
declare module SmallMouth {
    interface SmallMouthInterface {
        on(eventType: string, callback: (snapshot: SmallMouth.SnapshotInterface, previusChild?: string) => any, cancelCallbck?: Function, context?: any): SmallMouthInterface;
        on(eventType: string, callback: (snapshot: SmallMouth.SnapshotInterface, previusChild?: string) => any, context?: any): SmallMouthInterface;
        set(value: any, onComplete?: (error: any) => any): SmallMouthInterface;
        child(childPath: string): SmallMouthInterface;
        parent(): SmallMouthInterface;
        root(): SmallMouthInterface;
        name(): string;
        toString(): string;
        update(value: any, onComplete?: (error: any) => any): SmallMouthInterface;
        remove(onComplete?: (error: any) => any): void;
        off(eventType: string, callback?: Function, context?: any): SmallMouthInterface;
    }
}
declare module SmallMouth {
    class Resource implements SmallMouth.SmallMouthInterface {
        private _path;
        private _host;
        constructor(address: string);
        public on(eventType: string, callback: (snapshot: SmallMouth.SnapshotInterface, previusChild?: string) => any, cancelCallback?: Function, context?: any): Resource;
        public off(eventType: string, callback?: Function, context?: any): Resource;
        public set(value: any, onComplete?: (error: any) => any): Resource;
        public update(value: any, onComplete?: (error: any) => any): Resource;
        public remove(onComplete?: (error: any) => any): void;
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
