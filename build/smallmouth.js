var SmallMouth;
(function (SmallMouth) {
    var syncTimeout;

    var dataRegistry = JSON.parse(localStorage.getItem('LargeMouth_Registry')) || {
        data: null,
        children: {},
        version: 0
    };

    function createSubDataFromObject(data, obj) {
        if (obj instanceof Object && !(obj instanceof String) && !(obj instanceof Number) && !(obj instanceof Array) && !(obj instanceof Boolean)) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (!data.children.hasOwnProperty(key)) {
                        data.children[key] = {
                            children: {},
                            version: 0
                        };
                    } else {
                        data.children[key].version++;
                    }

                    createSubDataFromObject(data.children[key], obj[key]);
                }
            }
        } else {
            data.data = obj;
        }
    }

    function getData(path, options) {
        if (!options)
            options = {};
        if (path.trim() == '')
            return dataRegistry;

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

        createSubDataFromObject(data, value);

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

    function resetRegistry() {
        dataRegistry.data = null;
        dataRegistry.children = {};
        dataRegistry.version = 0;

        localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
    }

    SmallMouth._registry = {
        sync: sync,
        initializeRegistry: initializeRegistry,
        updateRegistry: updateRegistry,
        getData: getData,
        dataRegistry: dataRegistry,
        resetRegistry: resetRegistry
    };
})(SmallMouth || (SmallMouth = {}));
var SmallMouth;
(function (SmallMouth) {
    var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');
    var connections = {};

    var Resource = (function () {
        function Resource(address) {
            this._callbacks = [];
            var parse = urlReg.exec(address), scheme = parse[1], domain = parse[3], path = parse[5], query = parse[6], host = (scheme ? scheme : "") + (domain ? domain : ""), url = this.cleanPath((path ? path : "") + (query ? query : "")), socket = connections[host], scope = this;

            this._path = url;
            this._host = host;
            this._socket = socket ? socket : (socket = connections[host] = io.connect(host));

            SmallMouth._registry.initializeRegistry(this);
        }
        Resource.prototype.on = function (eventType, callback, cancelCallbck, context) {
            var scope = this;

            this._callbacks.push({
                type: eventType,
                callback: function () {
                    return callback.call(context, null);
                }
            });

            return this;
        };

        Resource.prototype.set = function (value, onComplete) {
            SmallMouth._registry.updateRegistry(this, value);

            return this;
        };

        Resource.prototype.update = function (value, onComplete) {
            return this;
        };

        Resource.prototype.child = function (childPath) {
            return new Resource(this._host + '/' + this._path + '/' + this.cleanPath(childPath));
        };

        Resource.prototype.parent = function () {
            return new Resource(this._host + '/' + this._path.substring(0, this._path.lastIndexOf('/')));
        };

        Resource.prototype.root = function () {
            return new Resource(this._host + '/' + this._path.substring(0, this._path.indexOf('/')));
        };

        Resource.prototype.name = function () {
            return this._path.substring(this._path.lastIndexOf('/') + 1);
        };

        Resource.prototype.toString = function () {
            return this._path;
        };

        Resource.prototype.cleanPath = function (_path) {
            _path = _path.charAt(0) === '/' ? _path.substring(1) : _path;
            _path = _path.charAt(_path.length - 1) === '/' ? _path.substring(0, _path.length - 1) : _path;
            return _path;
        };

        Resource.prototype._getSnapshot = function () {
            return SmallMouth._registry.getData(this._path);
        };
        return Resource;
    })();
    SmallMouth.Resource = Resource;
})(SmallMouth || (SmallMouth = {}));
//# sourceMappingURL=smallmouth.js.map
