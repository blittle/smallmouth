/// <reference path="../d.ts/DefinitelyTyped/sockjs/sockjs.d.ts" />
/// <reference path="../d.ts/DefinitelyTyped/node/node.d.ts" />
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
    interface ServerAdapter {
        socket: any;
        id: string;
        connect(host: any, auth?: SmallMouth.AuthInterface, onSuccess?: (error: any) => any): ServerAdapter;
        onMessage(type: string, callback?: (error: any) => any): ServerAdapter;
        send(type: string, data: any, onComplete?: (error: any) => any): ServerAdapter;
        unauth(): ServerAdapter;
        authenticated(): boolean;
        isConnected(): boolean;
    }
}
declare module SmallMouth {
    class SockJSAdapter implements SmallMouth.ServerAdapter {
        public socket: SockJS;
        public id: string;
        private eventListeners;
        private messageQueue;
        constructor();
        public connect(host: string, auth?: SmallMouth.AuthInterface, onComplete?: (error: any) => any): SockJSAdapter;
        public unauth(): SmallMouth.ServerAdapter;
        public authenticated(): boolean;
        public isConnected(): boolean;
        public onMessage(type: string, callback?: (resp: any) => any): SockJSAdapter;
        public send(type: string, data: any, onComplete?: (error: any) => any): SockJSAdapter;
    }
}
