/// <reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts" />
declare module SmallMouth {
    var _registry: {
        sync: (resource: any) => void;
        initializeRegistry: (resource: any) => void;
        updateRegistry: (resource: any, value: any) => void;
        getData: (path: any, options?: any) => any;
        dataRegistry: any;
        resetRegistry: () => void;
    };
}
declare module SmallMouth {
    interface SnapShotInterface {
        val(): any;
        child(path: string): SnapShotInterface;
        forEach(childAction: (childSnapshot: SnapShotInterface) => any): boolean;
        hasChild(childPath: string): boolean;
        hasChildren(): boolean;
        name(): string;
        numChildren(): number;
        ref(): SmallMouth.SmallMouthInterface;
        getPriority(): any;
        exportVal(): any;
    }
}
declare module SmallMouth {
    interface ServerValueInterface {
        TIMESTAMP: number;
    }
}
declare module SmallMouth {
    interface SmallMouthInterface {
        on(eventType: string, callback: (snapshot: SmallMouth.SnapShotInterface, previusChild?: string) => any, cancelCallbck?: Function, context?: any): SmallMouthInterface;
        set(value: any, onComplete?: (error: any) => any): SmallMouthInterface;
        child(childPath: string): SmallMouthInterface;
        parent(): SmallMouthInterface;
    }
}
declare module SmallMouth {
    class Resource implements SmallMouth.SmallMouthInterface {
        private _path;
        private _callbacks;
        private _socket;
        private _host;
        constructor(address: string);
        public on(eventType: string, callback: (snapshot: SmallMouth.SnapShotInterface, previusChild?: string) => any, cancelCallbck?: Function, context?: any): Resource;
        public set(value: any, onComplete?: (error: any) => any): Resource;
        public child(childPath: string): Resource;
        public parent(): Resource;
        private cleanPath(_path);
        private _getSnapshot();
    }
}
