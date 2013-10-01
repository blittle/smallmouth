var SmallMouth;
(function (SmallMouth) {
    var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');
    var connections = {};
    var dataRegistry = JSON.parse(localStorage.getItem('LargeMouth_Registry')) || {
        data: null,
        children: {},
        version: 0
    };

    var syncTimeout;

    function getData(path, options) {
        if (!options)
            options = {};

        var paths = path.split('/');
        var data = dataRegistry;

        for (var i = 0, iLength = paths.length; i < iLength; i++) {
            if (!data.children[paths[i]]) {
                data.children[paths[i]] = {
                    children: {},
                    version: 0
                };
            }

            if (options.versionUpdate)
                data.version++;

            data = data.children[paths[i]];
        }

        return data;
    }

    function updateRegistry(resource, value) {
        var data = getData(resource._path, { versionUpdate: true });
        data.data = value;
        data.version++;

        sync(resource);
    }

    function initializeRegistry(resource) {
        var data = getData(resource._path);
        resource.data = data.data;

        sync(resource);
    }

    function sync(resource) {
        if (syncTimeout)
            clearTimeout(syncTimeout);

        syncTimeout = setTimeout(function () {
            localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
        }, 100);
    }

    SmallMouth.dataRegistry = dataRegistry;

    function resetRegistry() {
        dataRegistry.data = null;
        dataRegistry.children = {};
        dataRegistry.version = 0;

        localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
    }
    SmallMouth.resetRegistry = resetRegistry;

    var Resource = (function () {
        function Resource(address) {
            this._callbacks = [];
            var parse = urlReg.exec(address), scheme = parse[1], domain = parse[3], path = parse[5], query = parse[6], host = (scheme ? scheme : "") + (domain ? domain : ""), url = this.cleanPath((path ? path : "") + (query ? query : "")), socket = connections[host], scope = this;

            this._path = url;
            this._socket = socket ? socket : (socket = connections[host] = io.connect(host));

            initializeRegistry(this);
        }
        Resource.prototype.on = function (eventType, callback, context) {
            var _this = this;
            var scope = this;

            this._callbacks.push({
                type: eventType,
                callback: function () {
                    return callback.call(context, _this._getSnapshot());
                }
            });

            return this;
        };

        Resource.prototype.set = function (value, onComplete) {
            updateRegistry(this, value);

            return this;
        };

        Resource.prototype.cleanPath = function (_path) {
            _path = _path.charAt(0) === '/' ? _path.substring(1) : _path;
            return _path;
        };

        Resource.prototype._getSnapshot = function () {
            return getData(this._path);
        };
        return Resource;
    })();
    SmallMouth.Resource = Resource;
})(SmallMouth || (SmallMouth = {}));
//# sourceMappingURL=smallmouth.js.map
