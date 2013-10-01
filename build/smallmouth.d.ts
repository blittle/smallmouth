/// <reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts" />
declare module SmallMouth {
    var dataRegistry;
    function resetRegistry(): void;
    class Resource {
        private _path;
        private _callbacks;
        private _socket;
        constructor(address: string);
        public on(eventType: string, callback: Function, context: any): Resource;
        public set(value: any, onComplete: Function): Resource;
        private cleanPath(_path);
        private _getSnapshot();
    }
}
