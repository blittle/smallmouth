var SmallMouth;
(function (SmallMouth) {
    if (typeof require == 'function') {
        var NodeSockJS = require('sockjs-client-node');
    }

    var SockJSAdapter = (function () {
        function SockJSAdapter() {
            this.id = new Date().getTime() + "";
            this.needsAuth = false;
            this.authenticated = false;
            this.eventListeners = {};
            this.messageQueue = [];
        }
        SockJSAdapter.prototype.connect = function (host, auth, onComplete) {
            var _this = this;
            if (!host || this.socket)
                return;

            this.socket = new (NodeSockJS ? NodeSockJS : SockJS)(host);

            this.socket.onmessage = function (e) {
                var resp = JSON.parse(e.data);
                if (_this.eventListeners[resp.type]) {
                    _this.eventListeners[resp.type](resp.data);
                }
            };

            this.socket.onopen = function () {
                _this.socket.send({
                    type: 'auth',
                    data: {
                        jsessionid: "",
                        sf2sessionid: ""
                    }
                });
            };

            this.onMessage('auth', function (resp) {
                if (resp.data.success) {
                    _this.authenticated = true;

                    while (_this.messageQueue.length) {
                        _this.socket.send(_this.messageQueue.splice(0, 1)[0]);
                    }
                } else {
                    _this.authenticated = false;
                }
            });

            this.onMessage('ready', function (resp) {
                _this.id = resp.id;
            });

            return this;
        };

        SockJSAdapter.prototype.unauth = function () {
            this.authenticated = false;
            return this;
        };

        SockJSAdapter.prototype.isAuthenticated = function () {
            return this.authenticated;
        };

        SockJSAdapter.prototype.isConnected = function () {
            return this.socket.readyState === SockJS.OPEN && this.authenticated;
        };

        SockJSAdapter.prototype.onMessage = function (type, callback) {
            if (this.socket) {
                this.eventListeners[type] = callback;
            }
            return this;
        };

        SockJSAdapter.prototype.send = function (type, data, onComplete) {
            var packet;

            if (this.socket) {
                packet = JSON.stringify({
                    type: type,
                    data: data
                });

                if (this.socket.readyState === SockJS.OPEN && this.authenticated) {
                    this.socket.send(packet);
                } else {
                    this.messageQueue.push(packet);
                }
            }
            return this;
        };
        return SockJSAdapter;
    })();
    SmallMouth.SockJSAdapter = SockJSAdapter;
})(SmallMouth || (SmallMouth = {}));
