module SmallMouth._eventRegistry {

	var eventRegistry = {
		events: {},
		children: {}
	};

	function getEvent(path: string, options: any = {}) {
		var event = eventRegistry;
		var paths = path.split('/');

		var tempPath = paths[0];

		for(var i=0, iLength = paths.length; i < iLength; i++) {

			if(!event.children[paths[i]]) {
				event.children[paths[i]] = {
					events: {},
					children: {}	
				}
			}

			if(typeof options.trigger !== 'undefined') {
				var eventList = event.events[options.trigger];

				if(eventList) {

					var registryData = SmallMouth._dataRegistry.getData(tempPath);	
					var snapshot = new SmallMouth.Snapshot(
						tempPath,
						registryData,
						options.host
					);

					for(var j=0, jLength = eventList.length; j < jLength; j++) {
						eventList[j].callback.call(
							eventList[j].context, 
							snapshot
						);
					}
				}
			}			

			event = event.children[paths[i]];
			
			if(i) {
				tempPath = tempPath + "/" + paths[i];
			}
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

	function triggerEvent(path: string, type: string, host: string, snapshot) {
		var event = getEvent(path, {trigger: type, host: host});

		var eventList = event.events[type];

		if(!eventList) return;

		for(var i=0, iLength = eventList.length; i < iLength; i++) {
			eventList[i].callback.call(eventList[i].context, snapshot);
		}
	}

	function resetRegistry() {
		eventRegistry.events = {};
		eventRegistry.children = {};
	}

	export var addEvent = addEvent;
	export var removeEvent = removeEvent;
	export var triggerEvent = triggerEvent;
	export var resetRegistry = resetRegistry;
	export var eventRegistry = eventRegistry;
}