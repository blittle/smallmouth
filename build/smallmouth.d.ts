/// <reference path="../d.ts/DefinitelyTyped/socket.io/socket.io.d.ts" />
declare module SmallMouth {
    class Resource {
        private _path;
        private attributes;
        private _callbacks;
        private _socket;
        constructor(address: string);
        public on(eventType: string, callback: Function, context: any): Resource;
        public set(value: any, onComplete: Function): Resource;
    }
}
