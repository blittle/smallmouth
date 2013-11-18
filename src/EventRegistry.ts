///<reference path="DataRegistry"/>
///<reference path="SmallMouth"/>

module SmallMouth {

	export class EventRegistry {

		private eventRegistry;
		private _host: string;

		constructor(host: string) {
			this.eventRegistry = {
				events: {},
				children: {}
			};

			this._host = host;
		}

		addEvent(
			path: string, type: string, callback: Function, context
		): EventRegistry {

			var event = this.getEvent(path);

			event.events[type] || (event.events[type] = []);
			
			event.events[type].push({
				callback: callback,
				context: context
			});

			return this;
		}

		removeEvent(
			path: string, type: string, callback: Function
		): any {
			var removeIndex;

			var event = this.getEvent(path);

			if(typeof type === 'undefined' || type === null) {
				var keys : string[] = Object.keys(event.events);
				for( var i=0, iLength = keys.length; i < iLength; i++) {
					delete event.events[keys[i]];
				}
				return;
			}

			if(!event.events[type]) return;

			if(typeof callback !== 'function') {
				return event.events[type].length = 0;
			}

			for(var i=0, iLength : number = event.events[type].length; i < iLength; i++) {
				if(event.events[type][i].callback === callback) {
					removeIndex = i;
					break;
				}
			}

			if(typeof removeIndex !== 'undefined') {
				event.events[type].splice(removeIndex, 1);
			}
		}

		triggerEvent(
			path: string, type: string, host: string, snapshot, options: any = {}
		): EventRegistry {

			var event = this.getEvent(path, {trigger: type, host: host, local: options.local});

			var eventList = event.events[type];

			if(!eventList) return;

			for(var i=0, iLength = eventList.length; i < iLength; i++) {
				eventList[i].callback.call(eventList[i].context, snapshot, options);
			}

			return this;
		}

		resetRegistry(): EventRegistry {
			this.eventRegistry.events = {};
			this.eventRegistry.children = {};
			return this;
		}

		private getEvent(path: string, options: any = {}) {
			var event = this.eventRegistry;
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

						var registryData = SmallMouth.DataRegistry.getDataRegistry(options.host).getData(tempPath);	
						var snapshot = new SmallMouth.Snapshot(
							tempPath,
							registryData,
							options.host
						);

						for(var j=0, jLength = eventList.length; j < jLength; j++) {
							eventList[j].callback.call(
								eventList[j].context, 
								snapshot,
								options
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

		public static getEventRegistry(host: string): EventRegistry {
			return SmallMouth.hosts[host].eventRegistry;
		}
	}
}