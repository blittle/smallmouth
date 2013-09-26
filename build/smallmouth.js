var SmallMouth;
(function (SmallMouth) {
    var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');
    var connections = {};

    var Resource = (function () {
        function Resource(address) {
            this.attributes = {};
            this._callbacks = [];
            var parse = urlReg.exec(address), scheme = parse[1], domain = parse[3], path = parse[5], query = parse[6], host = (scheme ? scheme : "") + (domain ? domain : ""), url = this.cleanPath((path ? path : "") + (query ? query : "")), socket = connections[host], scope = this;

            this._path = url;
            this._socket = socket ? socket : (socket = connections[host] = io.connect(host));

            socket.on('data', function (data) {
                if (scope._path !== data.path)
                    return;

                scope.attributes[data.path] = data.value;
                for (var i = 0, iLength = scope._callbacks.length; i < iLength; i++) {
                    scope._callbacks[i].callback();
                }
            });

            socket.emit('subscribe', url);
        }
        Resource.prototype.on = function (eventType, callback, context) {
            var scope = this;

            this._callbacks.push({
                type: eventType,
                callback: function () {
                    return callback.call(context, scope.attributes[scope._path]);
                }
            });

            return this;
        };

        Resource.prototype.set = function (value, onComplete) {
            this._socket.emit('set', {
                path: this._path,
                value: value
            });

            return this;
        };

        Resource.prototype.cleanPath = function (_path) {
            _path = _path.charAt(0) === '/' ? _path.substring(1) : _path;
            return _path;
        };
        return Resource;
    })();
    SmallMouth.Resource = Resource;
})(SmallMouth || (SmallMouth = {}));
//# sourceMappingURL=smallmouth.js.map
