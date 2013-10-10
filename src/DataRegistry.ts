module SmallMouth {

	var syncTimeout;

	var dataRegistry = JSON.parse(localStorage.getItem('LargeMouth_Registry')) || {
		version: 0
	};

	var eventRegistry = {
		events: {},
		children: {}
	};

	function createSubDataFromObject(data, obj) {
		if(obj instanceof Object && !(obj instanceof String) && !(obj instanceof Number) && !(obj instanceof Array) && !(obj instanceof Boolean) ) {
			if(!data.children) data.children = {};

			for(var key in obj) {
				if(obj.hasOwnProperty(key)) {

					if(!data.children.hasOwnProperty(key)) {
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

	function getData(path, options?: any) {
		if(!options) options = {};
		if(path.trim() == '') return dataRegistry;

		var paths = path.split('/');
		var data = dataRegistry;
		
		for(var i=0, iLength = paths.length; i < iLength; i++) {	
			if(!data.children) data.children = {};

			if(!data.children[paths[i]]) {
				data.children[paths[i]] = {
					version: 0
				} 
			} 

			if(options.versionUpdate) data.version++;

			data = data.children[paths[i]];
		}

		return data;
	}

	function updateRegistry(resource, value: any, options: any = {}) {
		var data = getData(resource._path, {versionUpdate: true});

		if(!options.merge) {
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
		if(syncTimeout) clearTimeout(syncTimeout);

		syncTimeout = setTimeout(()=> {
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
		if(path.trim() == '') return dataRegistry;

		var paths = path.split('/');
		var data = dataRegistry;
		
		for(var i=0, iLength = (paths.length - 1); i < iLength; i++) {	
			if(!data.children) break;
			data = data.children[paths[i]];
			data.version++;
		}			

		delete data.children;
		delete data.data;
	}

	function getEvent(path: string) {
		var event = eventRegistry;
		var paths = path.split('/');

		for(var i=0, iLength = paths.length; i < iLength; i++) {
			if(!event.children[paths[i]]) {
				event.children[paths[i]] = {
					events: {},
					children: {}	
				}
			}

			event = event.children[paths[i]];
		}
		
		return event;	
	}

	function addEvent(path: string, type: string, callback: Function, context) {
		var event = getEvent(path);

		event.events[type] || (event.events[type] = []);
		
		event.events[type].push({
			callback: callback,
			context: context
		});
	}

	function removeEvent(path: string, type: string, callback: Function) {
		var removeIndex;

		var event = getEvent(path);

		if(!event.events[type]) return;

		for(var i=0, iLength = event.events[type].length; i < iLength; i++) {
			if(event.events[type][i].callback === callback) {
				removeIndex = i;
				break;
			}
		}

		if(typeof removeIndex !== 'undefined') {
			event.events[type].splice(removeIndex, 1);
		}
	}

	function triggerEvent(path: string, type: string, snapshot) {
		var event = getEvent(path);

		var eventList = event.events[type];

		if(!eventList) return;

		for(var i=0, iLength = eventList.length; i < iLength; i++) {
			eventList[i].callback.call(eventList[i].context, snapshot);
		}
	}

	export var _registry = {
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
	}
}