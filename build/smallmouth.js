var SmallMouth;
(function (SmallMouth) {
    var syncTimeout;

    var dataRegistry = JSON.parse(localStorage.getItem('LargeMouth_Registry')) || {
        version: 0
    };

    var eventRegistry = {
        events: {},
        children: {}
    };

    function createSubDataFromObject(data, obj) {
        if (obj instanceof Object && !(obj instanceof String) && !(obj instanceof Number) && !(obj instanceof Array) && !(obj instanceof Boolean)) {
            if (!data.children)
                data.children = {};

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
            if (!data.children)
                data.children = {};

            if (!data.children[paths[i]]) {
                data.children[paths[i]] = {
                    version: 0
                };
            }

            if (options.versionUpdate)
                data.version++;

            data = data.children[paths[i]];
        }

        return data;
    }

    function updateRegistry(resource, value, options) {
        if (typeof options === "undefined") { options = {}; }
        var data = getData(resource._path, { versionUpdate: true });

        if (!options.merge) {
            data.children = {};
            data.data = null;
        }

        createSubDataFromObject(data, value);

        data.version++;

        sync(resource);
    }

    function initializeRegistry(resource) {
        var data = getData(resource._path);

        sync(resource);
    }

    function sync(resource) {
        if (syncTimeout)
            clearTimeout(syncTimeout);

        syncTimeout = setTimeout(function () {
            localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
        }, 100);
    }

    function resetRegistries() {
        dataRegistry.data = null;
        dataRegistry.children = {};
        dataRegistry.version = 0;

        localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));

        eventRegistry.events = {};
        eventRegistry.children = {};
    }

    function remove(path) {
        if (path.trim() == '')
            return dataRegistry;

        var paths = path.split('/');
        var data = dataRegistry;

        for (var i = 0, iLength = (paths.length - 1); i < iLength; i++) {
            if (!data.children)
                break;
            data = data.children[paths[i]];
            data.version++;
        }

        delete data.children;
        delete data.data;
    }

    function getEvent(path) {
        var event = eventRegistry;
        var paths = path.split('/');

        for (var i = 0, iLength = paths.length; i < iLength; i++) {
            if (!event.children[paths[i]]) {
                event.children[paths[i]] = {
                    events: {},
                    children: {}
                };
            }

            event = event.children[paths[i]];
        }

        return event;
    }

    function addEvent(path, type, callback, context) {
        var event = getEvent(path);

        event.events[type] || (event.events[type] = []);

        event.events[type].push({
            callback: callback,
            context: context
        });
    }

    function removeEvent(path, type, callback) {
        var removeIndex;

        var event = getEvent(path);

        if (!event.events[type])
            return;

        for (var i = 0, iLength = event.events[type].length; i < iLength; i++) {
            if (event.events[type][i].callback === callback) {
                removeIndex = i;
                break;
            }
        }

        if (typeof removeIndex !== 'undefined') {
            event.events[type].splice(removeIndex, 1);
        }
    }

    function triggerEvent(path, type, snapshot) {
        var event = getEvent(path);

        var eventList = event.events[type];

        if (!eventList)
            return;

        for (var i = 0, iLength = eventList.length; i < iLength; i++) {
            eventList[i].callback.call(eventList[i].context, snapshot);
        }
    }

    SmallMouth._registry = {
        sync: sync,
        initializeRegistry: initializeRegistry,
        updateRegistry: updateRegistry,
        getData: getData,
        dataRegistry: dataRegistry,
        eventRegistry: eventRegistry,
        resetRegistries: resetRegistries,
        remove: remove,
        addEvent: addEvent,
        removeEvent: removeEvent,
        triggerEvent: triggerEvent
    };
})(SmallMouth || (SmallMouth = {}));
var SmallMouth;
(function (SmallMouth) {
    var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');
    var connections = {};

    var Resource = (function () {
        function Resource(address) {
            var parse = urlReg.exec(address), scheme = parse[1], domain = parse[3], path = parse[5], query = parse[6], host = (scheme ? scheme : "") + (domain ? domain : ""), url = Resource.cleanPath((path ? path : "") + (query ? query : "")), socket = connections[host], scope = this;

            this._path = url;
            this._host = host;
            this._socket = socket ? socket : (socket = connections[host] = io.connect(host));

            SmallMouth._registry.initializeRegistry(this);
        }
        Resource.prototype.on = function (eventType, callback, cancelCallback, context) {
            if (typeof cancelCallback == 'function') {
                SmallMouth._registry.addEvent(this._path, eventType, callback, context);
                SmallMouth._registry.addEvent(this._path, "cancel", cancelCallback, context);
            } else {
                SmallMouth._registry.addEvent(this._path, eventType, callback, cancelCallback);
            }

            return this;
        };

        Resource.prototype.off = function (eventType, callback, context) {
            SmallMouth._registry.removeEvent(this._path, eventType, callback);
            return this;
        };

        Resource.prototype.set = function (value, onComplete) {
            SmallMouth._registry.updateRegistry(this, value);
            SmallMouth._registry.triggerEvent(this._path, 'value', this._getSnapshot());
            return this;
        };

        Resource.prototype.update = function (value, onComplete) {
            SmallMouth._registry.updateRegistry(this, value, { merge: true });
            return this;
        };

        Resource.prototype.remove = function (onComplete) {
            SmallMouth._registry.remove(this._path);
        };

        Resource.prototype.child = function (childPath) {
            return new Resource(this._host + '/' + this._path + '/' + Resource.cleanPath(childPath));
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

        Resource.cleanPath = function (_path) {
            _path = _path.charAt(0) === '/' ? _path.substring(1) : _path;
            _path = _path.charAt(_path.length - 1) === '/' ? _path.substring(0, _path.length - 1) : _path;
            return _path;
        };

        Resource.prototype._getSnapshot = function () {
            var data = SmallMouth._registry.getData(this._path);

            if (!data)
                return undefined;

            return new SmallMouth.Snapshot(this._path, data, this._host);
        };
        return Resource;
    })();
    SmallMouth.Resource = Resource;
})(SmallMouth || (SmallMouth = {}));
var SmallMouth;
(function (SmallMouth) {
    function getJSON(data) {
        var obj = {};

        if (data.data) {
            return data.data;
        } else if (!data.children) {
            return null;
        } else {
            for (var key in data.children) {
                if (data.children.hasOwnProperty(key)) {
                    obj[key] = getJSON(data.children[key]);
                }
            }
        }

        return obj;
    }

    var Snapshot = (function () {
        function Snapshot(path, data, host) {
            this._path = path;
            this._host = host;

            this._data = JSON.parse(JSON.stringify(data));
            this.version = data.version;
        }
        Snapshot.prototype.val = function () {
            return getJSON(this._data);
        };

        Snapshot.prototype.child = function (path) {
            path = this._path + '/' + SmallMouth.Resource.cleanPath(path);

            var data = SmallMouth._registry.getData(path);

            if (!data)
                return undefined;

            return new Snapshot(path, data, this._host);
        };

        Snapshot.prototype.forEach = function (childAction) {
            var children = this._data.children;

            for (var key in children) {
                if (children.hasOwnProperty(key)) {
                    var path = this._path + '/' + key;

                    var cancel = childAction.call(this, new Snapshot(path, SmallMouth._registry.getData(path), this._host));

                    if (cancel)
                        return true;
                }
            }

            return false;
        };

        Snapshot.prototype.hasChild = function (childPath) {
            childPath = this._path + '/' + SmallMouth.Resource.cleanPath(childPath);
            var data = SmallMouth._registry.getData(childPath);
            return typeof data.children !== 'undefined' || typeof data.data !== 'undefined';
        };

        Snapshot.prototype.hasChildren = function () {
            return this.numChildren() > 0;
        };

        Snapshot.prototype.name = function () {
            return this._path.substring(this._path.lastIndexOf('/') + 1);
        };

        Snapshot.prototype.numChildren = function () {
            return this._data.children ? Object.keys(this._data.children).length : 0;
        };

        Snapshot.prototype.ref = function () {
            return new SmallMouth.Resource(this._host + '/' + this._path);
        };
        return Snapshot;
    })();
    SmallMouth.Snapshot = Snapshot;
})(SmallMouth || (SmallMouth = {}));
//# sourceMappingURL=smallmouth.js.map
