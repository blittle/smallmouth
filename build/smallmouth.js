var SmallMouth;
(function (SmallMouth) {
    (function (_dataRegistry) {
        var syncTimeout;

        var isEqual = function (a, b) {
            return (function eq(a, b, aStack, bStack) {
                if (a === b)
                    return a !== 0 || 1 / a == 1 / b;

                if (a == null || b == null)
                    return a === b;

                var className = toString.call(a);
                if (className != toString.call(b))
                    return false;
                switch (className) {
                    case '[object String]':
                        return a == String(b);
                    case '[object Number]':
                        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
                    case '[object Date]':
                    case '[object Boolean]':
                        return +a == +b;

                    case '[object RegExp]':
                        return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
                }
                if (typeof a != 'object' || typeof b != 'object')
                    return false;

                var length = aStack.length;
                while (length--) {
                    if (aStack[length] == a)
                        return bStack[length] == b;
                }

                var aCtor = a.constructor, bCtor = b.constructor;
                if (aCtor !== bCtor && !(typeof aCtor == 'function') && (aCtor instanceof aCtor) && (typeof bCtor === 'function') && (bCtor instanceof bCtor)) {
                    return false;
                }

                aStack.push(a);
                bStack.push(b);
                var size = 0, result = true;

                if (className == '[object Array]') {
                    size = a.length;
                    result = size == b.length;
                    if (result) {
                        while (size--) {
                            if (!(result = eq(a[size], b[size], aStack, bStack)))
                                break;
                        }
                    }
                } else {
                    for (var key in a) {
                        if (Object.hasOwnProperty.call(a, key)) {
                            size++;

                            if (!(result = Object.hasOwnProperty.call(b, key) && eq(a[key], b[key], aStack, bStack)))
                                break;
                        }
                    }

                    if (result) {
                        for (key in b) {
                            if (Object.hasOwnProperty.call(b, key) && !(size--))
                                break;
                        }
                        result = !size;
                    }
                }

                aStack.pop();
                bStack.pop();
                return result;
            })(a, b, [], []);
        };

        var dataRegistry = JSON.parse(localStorage.getItem('LargeMouth_Registry')) || {
            version: 0
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
                data.value = obj;
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
            var data = getData(resource._path);

            var dataCache = JSON.parse(JSON.stringify(data));

            if (!options.merge) {
                data.children = {};
                data.value = null;
            }

            createSubDataFromObject(data, value);

            if (!isEqual(data, dataCache)) {
                var data = getData(resource._path, { versionUpdate: true });
                data.version++;
                sync(resource);
                return true;
            }

            return false;
        }

        function serverUpdateData(path, element) {
            var data = getData(path, { versionUpdate: true });
            if (element)
                _mergeRemoteData(data, element);
            localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
        }

        function serverSetData(path, element) {
            var data = getData(path, { versionUpdate: true });
            data.children = {};
            if (element)
                _mergeRemoteData(data, element);
            localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
        }

        function _mergeRemoteData(local, remote) {
            local.version = remote.version;

            if (remote.value)
                local.value = remote.value;
else {
                if (!local.children)
                    local.children = {};

                for (var el in remote.children) {
                    if (remote.children.hasOwnProperty(el)) {
                        if (!local.children[el]) {
                            local.children[el] = {
                                version: 0
                            };
                        }

                        _mergeRemoteData(local.children[el], remote.children[el]);
                    }
                }
            }
        }

        function initializeRegistry(resource) {
            return getData(resource._path);
        }

        function sync(resource) {
            localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));

            if (resource._host) {
                SmallMouth.largeMouthAdapter.syncRemote(resource._host, getData(resource._path), resource._path);
            }
        }

        function resetRegistry() {
            dataRegistry.value = null;
            dataRegistry.children = {};
            dataRegistry.version = 0;

            localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
        }

        function remove(resource) {
            var path = resource._path;

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
            delete data.value;

            if (resource._host)
                sync(resource);
        }

        function getVersions(path) {
            var paths = path.split('/');
            var data = dataRegistry;

            var versions = [];

            for (var i = 0, iLength = paths.length; i < iLength; i++) {
                if (!data)
                    break;
                versions.push(data.version);
                if (!data.children)
                    break;
                data = data.children[paths[i]];
            }

            return versions;
        }

        _dataRegistry.initializeRegistry = initializeRegistry;
        _dataRegistry.updateRegistry = updateRegistry;
        _dataRegistry.getData = getData;
        _dataRegistry.dataRegistry = dataRegistry;
        _dataRegistry.resetRegistry = resetRegistry;
        _dataRegistry.remove = remove;
        _dataRegistry.getVersions = getVersions;
        _dataRegistry.serverUpdateData = serverUpdateData;
        _dataRegistry.serverSetData = serverSetData;
    })(SmallMouth._dataRegistry || (SmallMouth._dataRegistry = {}));
    var _dataRegistry = SmallMouth._dataRegistry;
})(SmallMouth || (SmallMouth = {}));
var SmallMouth;
(function (SmallMouth) {
    (function (_eventRegistry) {
        var eventRegistry = {
            events: {},
            children: {}
        };

        function getEvent(path, options) {
            if (typeof options === "undefined") { options = {}; }
            var event = eventRegistry;
            var paths = path.split('/');

            var tempPath = paths[0];

            for (var i = 0, iLength = paths.length; i < iLength; i++) {
                if (!event.children[paths[i]]) {
                    event.children[paths[i]] = {
                        events: {},
                        children: {}
                    };
                }

                if (typeof options.trigger !== 'undefined') {
                    var eventList = event.events[options.trigger];

                    if (eventList) {
                        var registryData = SmallMouth._dataRegistry.getData(tempPath);
                        var snapshot = new SmallMouth.Snapshot(tempPath, registryData, options.host);

                        for (var j = 0, jLength = eventList.length; j < jLength; j++) {
                            eventList[j].callback.call(eventList[j].context, snapshot, options);
                        }
                    }
                }

                event = event.children[paths[i]];

                if (i) {
                    tempPath = tempPath + "/" + paths[i];
                }
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

            if (typeof type === 'undefined' || type === null) {
                var keys = Object.keys(event.events);
                for (var i = 0, iLength = keys.length; i < iLength; i++) {
                    delete event.events[keys[i]];
                }
                return;
            }

            if (!event.events[type])
                return;

            if (typeof callback !== 'function') {
                return event.events[type].length = 0;
            }

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

        function triggerEvent(path, type, host, snapshot, options) {
            if (typeof options === "undefined") { options = {}; }
            var event = getEvent(path, { trigger: type, host: host, remote: options.remote });

            var eventList = event.events[type];

            if (!eventList)
                return;

            for (var i = 0, iLength = eventList.length; i < iLength; i++) {
                eventList[i].callback.call(eventList[i].context, snapshot, options);
            }
        }

        function resetRegistry() {
            eventRegistry.events = {};
            eventRegistry.children = {};
        }

        _eventRegistry.addEvent = addEvent;
        _eventRegistry.removeEvent = removeEvent;
        _eventRegistry.triggerEvent = triggerEvent;
        _eventRegistry.resetRegistry = resetRegistry;
        _eventRegistry.eventRegistry = eventRegistry;
    })(SmallMouth._eventRegistry || (SmallMouth._eventRegistry = {}));
    var _eventRegistry = SmallMouth._eventRegistry;
})(SmallMouth || (SmallMouth = {}));
var SmallMouth;
(function (SmallMouth) {
    (function (largeMouthAdapter) {
        var connections = {};

        function connect(host) {
            var socket;
            if (!host)
                return;

            if (connections[host]) {
                socket = connections[host];

                return socket;
            } else {
                socket = connections[host] = io.connect(host);
            }

            socket.on('data', function (resp) {
            });

            socket.on('set', function (resp) {
                SmallMouth._dataRegistry.serverSetData(resp.path, resp.value);

                var registryData = SmallMouth._dataRegistry.getData(resp.path);

                SmallMouth._eventRegistry.triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(resp.path, registryData, host), { remote: true });
            });

            socket.on('update', function (resp) {
                SmallMouth._dataRegistry.serverUpdateData(resp.path, resp.value);

                var registryData = SmallMouth._dataRegistry.getData(resp.path);

                SmallMouth._eventRegistry.triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(resp.path, registryData, host), { remote: true });
            });

            socket.on('syncSuccess', function (resp) {
                console.log(resp);
            });

            socket.on('syncError', function (resp) {
            });

            socket.on('ready', function (resp) {
                connections[host].id = resp.id;
            });

            return socket;
        }

        function subscribe(host, url) {
            var socket = connections[host];
            if (!socket)
                return;

            socket.emit('subscribe', {
                url: url,
                value: SmallMouth._dataRegistry.getData(url)
            });
        }

        function syncRemote(host, data, url) {
            var socket = connections[host];
            if (!socket)
                return;

            socket.emit('set', {
                url: url,
                value: data
            });
        }

        function generateId(host) {
            var id = (new Date()).getTime() + "";
            if (host)
                id = connections[host].id + '-' + id;
            return id;
        }

        largeMouthAdapter.connect = connect;
        largeMouthAdapter.subscribe = subscribe;
        largeMouthAdapter.syncRemote = syncRemote;
        largeMouthAdapter.generateId = generateId;
    })(SmallMouth.largeMouthAdapter || (SmallMouth.largeMouthAdapter = {}));
    var largeMouthAdapter = SmallMouth.largeMouthAdapter;
})(SmallMouth || (SmallMouth = {}));
var SmallMouth;
(function (SmallMouth) {
    var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');

    var Resource = (function () {
        function Resource(address) {
            var parse = urlReg.exec(address), scheme = parse[1], domain = parse[3], path = parse[5], query = parse[6], host = (scheme ? scheme : "") + (domain ? domain : ""), url = Resource.cleanPath((path ? path : "") + (query ? query : "")), scope = this;

            this._path = url;
            this._host = host;

            var data = SmallMouth._dataRegistry.initializeRegistry(this);

            SmallMouth.largeMouthAdapter.connect(host);
            SmallMouth.largeMouthAdapter.subscribe(host, url);
        }
        Resource.prototype.on = function (eventType, callback, cancelCallback, context) {
            if (typeof cancelCallback == 'function') {
                SmallMouth._eventRegistry.addEvent(this._path, eventType, callback, context);
                SmallMouth._eventRegistry.addEvent(this._path, "cancel", cancelCallback, context);
                callback.call(context, this._getSnapshot());
            } else {
                SmallMouth._eventRegistry.addEvent(this._path, eventType, callback, cancelCallback);
                callback.call(cancelCallback, this._getSnapshot());
            }

            return this;
        };

        Resource.prototype.off = function (eventType, callback, context) {
            SmallMouth._eventRegistry.removeEvent(this._path, eventType, callback);
            return this;
        };

        Resource.prototype.set = function (value, onComplete) {
            var changed = SmallMouth._dataRegistry.updateRegistry(this, value);
            if (changed)
                SmallMouth._eventRegistry.triggerEvent(this._path, 'value', this._host, this._getSnapshot());
            return this;
        };

        Resource.prototype.update = function (value, onComplete) {
            var changed = SmallMouth._dataRegistry.updateRegistry(this, value, { merge: true });
            if (changed)
                SmallMouth._eventRegistry.triggerEvent(this._path, 'value', this._host, this._getSnapshot());
            return this;
        };

        Resource.prototype.remove = function (onComplete) {
            SmallMouth._dataRegistry.remove(this);
            SmallMouth._eventRegistry.triggerEvent(this._path, 'value', this._host, this._getSnapshot());
        };

        Resource.prototype.push = function (value, complete) {
            var id = SmallMouth.largeMouthAdapter.generateId(this._host);
            var ref = this.child(id);

            if (typeof value !== 'undefined') {
                ref.set(value);
            }

            return ref;
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
            var data = SmallMouth._dataRegistry.getData(this._path);

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

        if (typeof data.value !== 'undefined' && data.value != null) {
            return data.value;
        } else if (!data.children || !Object.keys(data.children).length) {
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

            var data = SmallMouth._dataRegistry.getData(path);

            if (!data)
                return undefined;

            return new Snapshot(path, data, this._host);
        };

        Snapshot.prototype.forEach = function (childAction) {
            var children = this._data.children;

            for (var key in children) {
                if (children.hasOwnProperty(key)) {
                    var path = this._path + '/' + key;

                    var cancel = childAction.call(this, new Snapshot(path, SmallMouth._dataRegistry.getData(path), this._host));

                    if (cancel)
                        return true;
                }
            }

            return false;
        };

        Snapshot.prototype.hasChild = function (childPath) {
            childPath = this._path + '/' + SmallMouth.Resource.cleanPath(childPath);
            var data = SmallMouth._dataRegistry.getData(childPath);
            return typeof data.children !== 'undefined' || typeof data.value !== 'undefined';
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
