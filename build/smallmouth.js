var SmallMouth;
(function (SmallMouth) {
    var urlReg = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\([^#]*))?(#(.*))?');

    var Resource = (function () {
        function Resource(address) {
            var parse = urlReg.exec(address), scheme = parse[1], domain = parse[3], path = parse[5], query = parse[6], host = (scheme ? scheme : "") + (domain ? domain : ""), path = Resource.cleanPath((path ? path : "") + (query ? query : "")), scope = this;

            host = host ? host : SmallMouth.defaultHost;

            this._path = path;
            this._host = host;

            this._eventRegistry = SmallMouth.makeEventRegistry(host);

            this._largeMouthAdapter = SmallMouth.makeConnection(host);
            this._dataRegistry = SmallMouth.makeDataRegistry(host, this._largeMouthAdapter);

            var data = this._dataRegistry.initializeResource(this);
            this._largeMouthAdapter.subscribe(path);
        }
        Resource.prototype.on = function (eventType, callback, cancelCallback, context) {
            if (typeof cancelCallback == 'function') {
                this._eventRegistry.addEvent(this._path, eventType, callback, context);
                this._eventRegistry.addEvent(this._path, "cancel", cancelCallback, context);
                callback.call(context, this._getSnapshot(), { local: true });
            } else {
                this._eventRegistry.addEvent(this._path, eventType, callback, cancelCallback);
                callback.call(cancelCallback, this._getSnapshot(), { local: true });
            }

            return this;
        };

        Resource.prototype.off = function (eventType, callback, context) {
            this._eventRegistry.removeEvent(this._path, eventType, callback);
            return this;
        };

        Resource.prototype.set = function (value, onComplete) {
            var changed = this._dataRegistry.updateRegistry(this, value, { onComplete: onComplete });
            if (changed)
                this._eventRegistry.triggerEvent(this._path, 'value', this._host, this._getSnapshot(), { local: true });
            return this;
        };

        Resource.prototype.update = function (value, onComplete) {
            var changed = this._dataRegistry.updateRegistry(this, value, { merge: true, onComplete: onComplete });
            if (changed)
                this._eventRegistry.triggerEvent(this._path, 'value', this._host, this._getSnapshot(), { local: true });
            return this;
        };

        Resource.prototype.remove = function (onComplete) {
            this._dataRegistry.remove(this, { onComplete: onComplete });
            this._eventRegistry.triggerEvent(this._path, 'value', this._host, this._getSnapshot(), { local: true });
        };

        Resource.prototype.push = function (value, onComplete) {
            var id = this._largeMouthAdapter.generateId();
            var ref = this.child(id);

            if (typeof value !== 'undefined') {
                ref.set(value, onComplete);
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

        Resource.prototype.postMessage = function (key, data) {
            this._largeMouthAdapter.adapter.send(key, data);
            return this;
        };

        Resource.prototype.getSocket = function () {
            return this._largeMouthAdapter.adapter.socket;
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
            var data = this._dataRegistry.getData(this._path);

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
    SmallMouth.hosts = {};

    SmallMouth.defaultHost = '';

    SmallMouth.makeConnection = function (host) {
        if (!SmallMouth.hosts[host])
            SmallMouth.hosts[host] = {};
        if (SmallMouth.hosts[host].connection)
            return SmallMouth.hosts[host].connection;
        return SmallMouth.hosts[host].connection = new SmallMouth.LargeMouthAdapter(host);
    };

    SmallMouth.makeDataRegistry = function (host, connection) {
        if (!SmallMouth.hosts[host])
            SmallMouth.hosts[host] = {};
        if (SmallMouth.hosts[host].data)
            return SmallMouth.hosts[host].data;
        return SmallMouth.hosts[host].data = new SmallMouth.DataRegistry(host, connection);
    };

    SmallMouth.makeEventRegistry = function (host) {
        if (!SmallMouth.hosts[host])
            SmallMouth.hosts[host] = {};
        if (SmallMouth.hosts[host].eventRegistry)
            return SmallMouth.hosts[host].eventRegistry;
        return SmallMouth.hosts[host].eventRegistry = new SmallMouth.EventRegistry(host);
    };

    function postMessage(host, key, data) {
        SmallMouth.makeConnection(host).adapter.send(key, data);
    }
    SmallMouth.postMessage = postMessage;

    function getAvailableAdapters() {
        return Object.keys(SmallMouth.SERVER_TYPES);
    }
    SmallMouth.getAvailableAdapters = getAvailableAdapters;

    function setSocketAdapter(adapter) {
        SmallMouth.serverAdapterType = SmallMouth.SERVER_TYPES[adapter];
    }
    SmallMouth.setSocketAdapter = setSocketAdapter;
})(SmallMouth || (SmallMouth = {}));
var SmallMouth;
(function (SmallMouth) {
    var EventRegistry = (function () {
        function EventRegistry(host) {
            this.eventRegistry = {
                events: {},
                children: {}
            };

            this._host = host;
        }
        EventRegistry.prototype.addEvent = function (path, type, callback, context) {
            var event = this.getEvent(path);

            event.events[type] || (event.events[type] = []);

            event.events[type].push({
                callback: callback,
                context: context
            });

            return this;
        };

        EventRegistry.prototype.removeEvent = function (path, type, callback) {
            var removeIndex;

            var event = this.getEvent(path);

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
        };

        EventRegistry.prototype.triggerEvent = function (path, type, host, snapshot, options) {
            if (typeof options === "undefined") { options = {}; }
            var event = this.getEvent(path, { trigger: type, host: host, local: options.local });

            var eventList = event.events[type];

            if (!eventList)
                return;

            for (var i = 0, iLength = eventList.length; i < iLength; i++) {
                eventList[i].callback.call(eventList[i].context, snapshot, options);
            }

            return this;
        };

        EventRegistry.prototype.resetRegistry = function () {
            this.eventRegistry.events = {};
            this.eventRegistry.children = {};
            return this;
        };

        EventRegistry.prototype.getEvent = function (path, options) {
            if (typeof options === "undefined") { options = {}; }
            var event = this.eventRegistry;
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
                        var registryData = SmallMouth.DataRegistry.getDataRegistry(options.host).getData(tempPath);
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
        };

        EventRegistry.getEventRegistry = function (host) {
            return SmallMouth.hosts[host].eventRegistry;
        };
        return EventRegistry;
    })();
    SmallMouth.EventRegistry = EventRegistry;
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
                    if (obj[key] == null) {
                        delete obj[key];
                    }
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

            var data = SmallMouth.DataRegistry.getDataRegistry(this._host).getData(path);

            if (!data)
                return undefined;

            return new Snapshot(path, data, this._host);
        };

        Snapshot.prototype.forEach = function (childAction) {
            var children = this._data.children;

            for (var key in children) {
                if (children.hasOwnProperty(key)) {
                    var path = this._path + '/' + key;

                    var cancel = childAction.call(this, new Snapshot(path, SmallMouth.DataRegistry.getDataRegistry(this._host).getData(path), this._host));

                    if (cancel)
                        return true;
                }
            }

            return false;
        };

        Snapshot.prototype.hasChild = function (childPath) {
            childPath = this._path + '/' + SmallMouth.Resource.cleanPath(childPath);
            var data = SmallMouth.DataRegistry.getDataRegistry(this._host).getData(childPath);
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
var SmallMouth;
(function (SmallMouth) {
    var SocketIOAdapter = (function () {
        function SocketIOAdapter() {
            this.id = new Date().getTime() + "";
        }
        SocketIOAdapter.prototype.connect = function (host) {
            var _this = this;
            if (!host || this.socket)
                return;

            this.socket = io.connect(host);

            this.onMessage('ready', function (resp) {
                _this.id = resp.id;
            });

            return this;
        };

        SocketIOAdapter.prototype.onMessage = function (type, callback) {
            if (this.socket)
                this.socket.on(type, callback);
            return this;
        };

        SocketIOAdapter.prototype.send = function (type, data, onComplete) {
            if (this.socket)
                this.socket.emit(type, data, onComplete);
            return this;
        };
        return SocketIOAdapter;
    })();
    SmallMouth.SocketIOAdapter = SocketIOAdapter;
})(SmallMouth || (SmallMouth = {}));
var SmallMouth;
(function (SmallMouth) {
    var SockJSAdapter = (function () {
        function SockJSAdapter() {
            this.id = new Date().getTime() + "";
            this.eventListeners = {};
            this.messageQueue = [];
        }
        SockJSAdapter.prototype.connect = function (host) {
            var _this = this;
            if (!host || this.socket)
                return;

            this.socket = new SockJS(host);

            this.socket.onmessage = function (e) {
                var resp = JSON.parse(e.data);
                if (_this.eventListeners[resp.type]) {
                    _this.eventListeners[resp.type](resp.data);
                }
            };

            this.socket.onopen = function () {
                while (_this.messageQueue.length) {
                    _this.socket.send(_this.messageQueue.splice(0, 1)[0]);
                }
            };

            this.onMessage('ready', function (resp) {
                _this.id = resp.id;
            });

            return this;
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

                if (this.socket.readyState === this.socket.OPEN) {
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
var SmallMouth;
(function (SmallMouth) {
    SmallMouth.SERVER_TYPES = {
        SOCK_JS: "SockJSAdapter",
        SOCKET_IO: "SocketIOAdapter",
        NATIVE: "NativeAdapter"
    };

    SmallMouth.serverAdapterType = SmallMouth.SERVER_TYPES.SOCKET_IO;

    var LargeMouthAdapter = (function () {
        function LargeMouthAdapter(host, type) {
            if (typeof type === "undefined") { type = SmallMouth.serverAdapterType; }
            this._callbackId = 0;
            this.adapter = new SmallMouth[type]();

            this.connect(host);
            this._host = host;
            this._callbacks = {};
        }
        LargeMouthAdapter.prototype.generateCallbackId = function () {
            return ++this._callbackId;
        };

        LargeMouthAdapter.prototype.connect = function (host) {
            var _this = this;
            this.adapter.connect(host);

            this.adapter.onMessage('set', function (resp) {
                SmallMouth.DataRegistry.getDataRegistry(_this._host).serverSetData(resp.path, resp.value);

                var registryData = SmallMouth.DataRegistry.getDataRegistry(_this._host).getData(resp.path);

                SmallMouth.EventRegistry.getEventRegistry(_this._host).triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(resp.path, registryData, host), { local: false });
            });

            this.adapter.onMessage('update', function (resp) {
                SmallMouth.DataRegistry.getDataRegistry(_this._host).serverUpdateData(resp.path, resp.value);

                var registryData = SmallMouth.DataRegistry.getDataRegistry(_this._host).getData(resp.path);

                SmallMouth.EventRegistry.getEventRegistry(_this._host).triggerEvent(resp.path, 'value', host, new SmallMouth.Snapshot(resp.path, registryData, host), { local: false });
            });

            this.adapter.onMessage('remove', function (resp) {
                SmallMouth.DataRegistry.getDataRegistry(_this._host).serverRemove(resp.path);

                SmallMouth.EventRegistry.getEventRegistry(_this._host).triggerEvent(resp.path, 'value', host, null, { local: false });
            });

            this.adapter.onMessage('syncComplete', function (resp) {
                _this.executeCallback(resp.reqId, resp.err, resp.path, resp.data);
            });

            return this;
        };

        LargeMouthAdapter.prototype.executeCallback = function (id, err, path, data) {
            if (typeof this._callbacks[id] == 'function') {
                this._callbacks[id](err);
                delete this._callbacks[id];
            }

            if (err && path) {
                SmallMouth.DataRegistry.getDataRegistry(this._host).resetData(path, data);

                SmallMouth.EventRegistry.getEventRegistry(this._host).triggerEvent(path, 'value', this._host, new SmallMouth.Snapshot(path, SmallMouth.DataRegistry.getDataRegistry(this._host).getData(path), this._host), { local: false });
            }
        };

        LargeMouthAdapter.prototype.subscribe = function (path) {
            if (!this._host)
                return;

            this.adapter.send('subscribe', {
                path: path,
                value: SmallMouth.DataRegistry.getDataRegistry(this._host).getData(path)
            });

            return this;
        };

        LargeMouthAdapter.prototype.syncRemote = function (method, path, data, onComplete) {
            if (!this._host)
                return;

            if (typeof onComplete == 'function') {
                var callbackId = this.generateCallbackId();
                this._callbacks[callbackId] = onComplete;
            }

            this.adapter.send(method, {
                path: path,
                value: data,
                reqId: callbackId
            });

            return this;
        };

        LargeMouthAdapter.prototype.setRemote = function (data, path, onComplete) {
            return this.syncRemote('set', path, data, onComplete);
        };

        LargeMouthAdapter.prototype.removeRemote = function (data, path, onComplete) {
            return this.syncRemote('remove', path, null, onComplete);
        };

        LargeMouthAdapter.prototype.generateId = function () {
            return this.adapter.id + "-" + (new Date()).getTime();
        };
        return LargeMouthAdapter;
    })();
    SmallMouth.LargeMouthAdapter = LargeMouthAdapter;
})(SmallMouth || (SmallMouth = {}));
var SmallMouth;
(function (SmallMouth) {
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

    function createSubDataFromObject(data, obj) {
        if (obj instanceof Object && !(obj instanceof String) && !(obj instanceof Number) && !(obj instanceof Array) && !(obj instanceof Boolean)) {
            if (!data.children)
                data.children = {};
            delete data.value;

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
            delete data.children;
        }
    }

    function mergeRemoteData(local, remote) {
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
                    mergeRemoteData(local.children[el], remote.children[el]);
                }
            }
        }
    }

    var DataRegistry = (function () {
        function DataRegistry(host, largeMouthAdapter) {
            this._largeMouthAdapter = largeMouthAdapter;

            this._dataRegistry = JSON.parse(localStorage.getItem('LargeMouth_Registry_' + host)) || {
                version: 0
            };

            this._host = host;
        }
        DataRegistry.prototype.initializeResource = function (resource) {
            return this.getData(resource._path);
        };

        DataRegistry.prototype.updateRegistry = function (resource, value, options) {
            if (typeof options === "undefined") { options = {}; }
            var data = this.getData(resource._path);

            var dataCache = JSON.parse(JSON.stringify(data));

            if (!options.merge) {
                data.children = {};
                data.value = null;
            }

            createSubDataFromObject(data, value);

            if (!isEqual(data, dataCache)) {
                var data = this.getData(resource._path, { versionUpdate: true });
                data.version++;
                this.persistSet(resource, options.onComplete);
                return true;
            }

            return false;
        };

        DataRegistry.prototype.getData = function (path, options) {
            if (!options)
                options = {};
            if (path.trim() == '')
                return this._dataRegistry;

            var paths = path.split('/');
            var data = this._dataRegistry;

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

                delete data.value;

                data = data.children[paths[i]];
            }

            return data;
        };

        DataRegistry.prototype.remove = function (resource, options) {
            if (typeof options === "undefined") { options = {}; }
            var path = resource._path;

            this.removePath(path);

            if (resource._host)
                this.persistRemove(resource, options.onComplete);
        };

        DataRegistry.prototype.serverRemove = function (path) {
            this.removePath(path);
            this.saveToLocalStorage();
        };

        DataRegistry.prototype.removePath = function (path) {
            if (path.trim() == '')
                return this._dataRegistry;

            var paths = path.split('/');
            var data = this._dataRegistry;

            for (var i = 0, iLength = (paths.length - 1); i < iLength; i++) {
                if (!data.children)
                    break;
                data = data.children[paths[i]];
                data.version++;
            }

            delete data.children[paths[paths.length - 1]];
        };

        DataRegistry.prototype.getVersions = function (path) {
            var paths = path.split('/');
            var data = this._dataRegistry;

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
        };

        DataRegistry.prototype.resetData = function (path, element) {
            var paths = path.split('/');
            var data = this._dataRegistry;

            for (var i = 0, iLength = paths.length; i < iLength; i++) {
                if (!data.children)
                    data.children = {};

                if (!data.children[paths[i]]) {
                    data.children[paths[i]] = {
                        version: 0
                    };
                }

                if (i === paths.length - 1) {
                    if (typeof element == 'undefined' || element == null) {
                        delete data.children[paths[i]];
                    } else {
                        data.children[paths[i]] = element;
                    }
                } else {
                    data = data.children[paths[i]];
                }
            }

            this.saveToLocalStorage();
        };

        DataRegistry.prototype.serverUpdateData = function (path, element) {
            var data = this.getData(path, { versionUpdate: true });
            if (element)
                mergeRemoteData(data, element);
            this.saveToLocalStorage();
        };

        DataRegistry.prototype.serverSetData = function (path, element) {
            var data = this.getData(path, { versionUpdate: true });
            data.children = {};
            if (element)
                mergeRemoteData(data, element);
            this.saveToLocalStorage();
        };

        DataRegistry.prototype.resetRegistry = function () {
            this._dataRegistry.value = null;
            this._dataRegistry.children = {};
            this._dataRegistry.version = 0;

            this.saveToLocalStorage();
        };

        DataRegistry.prototype.saveToLocalStorage = function () {
            localStorage.setItem('LargeMouth_Registry_' + this._host, JSON.stringify(this._dataRegistry));
        };

        DataRegistry.prototype.persistSet = function (resource, onComplete) {
            this.persist('setRemote', resource._path, this.getData(resource._path), onComplete);
        };

        DataRegistry.prototype.persistRemove = function (resource, onComplete) {
            this.persist('removeRemote', resource._path, null, onComplete);
        };

        DataRegistry.prototype.persist = function (method, path, data, onComplete) {
            this.saveToLocalStorage();

            this._largeMouthAdapter[method](data, path, onComplete);
        };

        DataRegistry.getDataRegistry = function (host) {
            return SmallMouth.hosts[host].data;
        };
        return DataRegistry;
    })();
    SmallMouth.DataRegistry = DataRegistry;
})(SmallMouth || (SmallMouth = {}));
var SmallMouth;
(function (SmallMouth) {
    var NativeAdapter = (function () {
        function NativeAdapter() {
            this.id = new Date().getTime() + "";
            this.eventListeners = {};
            this.messageQueue = [];
        }
        NativeAdapter.prototype.connect = function (host) {
            var _this = this;
            if (!host || this.socket)
                return;

            this.socket = new WebSocket(host);

            this.socket.onmessage = function (e) {
                var resp = JSON.parse(e.data);
                if (_this.eventListeners[resp.type]) {
                    _this.eventListeners[resp.type](resp.data);
                }
            };

            this.socket.onopen = function () {
                while (_this.messageQueue.length) {
                    _this.socket.send(_this.messageQueue.splice(0, 1)[0]);
                }
            };

            this.onMessage('ready', function (resp) {
                _this.id = resp.id;
            });

            return this;
        };

        NativeAdapter.prototype.onMessage = function (type, callback) {
            if (this.socket) {
                this.eventListeners[type] = callback;
            }
            return this;
        };

        NativeAdapter.prototype.send = function (type, data, onComplete) {
            var packet;

            if (this.socket) {
                packet = JSON.stringify({
                    type: type,
                    data: data
                });

                if (this.socket.readyState === 1) {
                    this.socket.send(packet);
                } else {
                    this.messageQueue.push(packet);
                }
            }
            return this;
        };
        return NativeAdapter;
    })();
    SmallMouth.NativeAdapter = NativeAdapter;
})(SmallMouth || (SmallMouth = {}));
//# sourceMappingURL=smallmouth.js.map
