///<reference path="LargeMouthAdapter"/>

module SmallMouth {	

	var syncTimeout;

	/**
	 * isEqual code taken from underscore.js (c) 2009-2013 Jeremy Ashkenas MIT License
	 */
	var isEqual = function(a, b) {

		return (function eq(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a == 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;	    
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className != toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, dates, and booleans are compared by value.
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return a == String(b);
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
	        // other numeric values.
	        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a == +b;
	      // RegExps are compared by their source patterns and flags.
	      case '[object RegExp]':
	        return a.source == b.source &&
	               a.global == b.global &&
	               a.multiline == b.multiline &&
	               a.ignoreCase == b.ignoreCase;
	    }
	    if (typeof a != 'object' || typeof b != 'object') return false;
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] == a) return bStack[length] == b;
	    }
	    // Objects with different constructors are not equivalent, but `Object`s
	    // from different frames are.
	    var aCtor = a.constructor, bCtor = b.constructor;
	    if (aCtor !== bCtor && !(typeof aCtor == 'function') && (aCtor instanceof aCtor) &&
	                             (typeof bCtor === 'function') && (bCtor instanceof bCtor)) {
	      return false;
	    }
	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);
	    var size = 0, result = true;
	    // Recursively compare objects and arrays.
	    if (className == '[object Array]') {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      size = a.length;
	      result = size == b.length;
	      if (result) {
	        // Deep compare the contents, ignoring non-numeric properties.
	        while (size--) {
	          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
	        }
	      }
	    } else {
	      // Deep compare objects.
	      for (var key in a) {
	        if (Object.hasOwnProperty.call(a, key)) {
	          // Count the expected number of properties.
	          size++;
	          // Deep compare each member.
	          if (!(result = Object.hasOwnProperty.call(b, key) && eq(a[key], b[key], aStack, bStack))) break;
	        }
	      }
	      // Ensure that both objects contain the same number of properties.
	      if (result) {
	        for (key in b) {
	          if (Object.hasOwnProperty.call(b, key) && !(size--)) break;
	        }
	        result = !size;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return result;
	  })(a, b, [], []);
	}	

	function createSubDataFromObject(data, obj) {
		if(obj instanceof Object && !(obj instanceof String) && !(obj instanceof Number) && !(obj instanceof Array) && !(obj instanceof Boolean) ) {
			if(!data.children) data.children = {};
			delete data.value;

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
			data.value = obj;
			delete data.children;
		}
	}

	function mergeRemoteData(local, remote) {
		local.version = remote.version;

		if(typeof remote.value !== 'undefined' && remote.value !== null) local.value = remote.value;
		else {
			if(!local.children) local.children = {};

			for(var el in remote.children) {
				if(remote.children.hasOwnProperty(el)) {
					if(!local.children[el]) {
						local.children[el] = {
							version: 0
						}
					}
					mergeRemoteData(local.children[el], remote.children[el]);
				}
			}
		}
	}

	export class DataRegistry {

		private _dataRegistry: any;
		private _host: string;
		private _largeMouthAdapter;

		constructor(host: string, largeMouthAdapter: SmallMouth.LargeMouthAdapter) {
			
			this._largeMouthAdapter = largeMouthAdapter;

			if(typeof localStorage !== 'undefined') {
				this._dataRegistry = JSON.parse(localStorage.getItem('LargeMouth_Registry_' + host))
			}

			if(!this._dataRegistry) {
				this._dataRegistry = {
					version: 0
				};
			}

			this._host = host;
		}

		initializeResource(resource: SmallMouth.Resource): DataRegistry {
			return this.getData(resource._path);
		}

		updateRegistry(resource: SmallMouth.Resource, value: any, options: any = {}): boolean {
			var data = this.getData(resource._path);

			var dataCache = JSON.parse(JSON.stringify(data));

			if(!options.merge) {
				data.children = {};
				data.value = null;
			}

			createSubDataFromObject(data, value);

			if(!isEqual(data, dataCache)) {
				var data = this.getData(resource._path, {versionUpdate: true});
				data.version++;
				this.persistSet(resource, options.onComplete);
				return true;
			}

			return false;
		}

		getData(path, options?: any) {
			if(!options) options = {};
			if(path.trim() == '') return this._dataRegistry;

			var paths = path.split('/');
			var data = this._dataRegistry;
			
			for(var i=0, iLength = paths.length; i < iLength; i++) {
				if(!data.children) data.children = {};

				if(!data.children[paths[i]]) {
					data.children[paths[i]] = {
						version: 0
					} 
				} 

				if(options.versionUpdate) data.version++;

				// Should be able to delete the current value 
				// because we are not at a leaf node
				delete data.value;

				data = data.children[paths[i]];
			}

			return data;
		}

		remove(resource: SmallMouth.Resource, options: any = {}) {
			var path = resource._path;

			this.removePath(path);

			if(resource._host) this.persistRemove(resource, options.onComplete);
		}

		serverRemove(path: string) {
			this.removePath(path);
			this.saveToLocalStorage();
		}

		removePath(path: string) {
			if(path.trim() == '') return this._dataRegistry;

			var paths = path.split('/');
			var data = this._dataRegistry;
			
			for(var i=0, iLength = (paths.length - 1); i < iLength; i++) {	
				if(!data.children) break;
				data = data.children[paths[i]];
				data.version++;
			}			

			delete data.children[paths[paths.length - 1]];
		}

		getVersions(path) {
			var paths = path.split('/');
			var data = this._dataRegistry;

			var versions = [];

			for(var i=0, iLength = paths.length; i < iLength; i++) {	
				if(!data) break;
				versions.push(data.version);
				if(!data.children) break;
				data = data.children[paths[i]];
			}

			return versions;
		}

		resetData(path: string, element: any) {
			var paths = path.split('/');
			var data = this._dataRegistry;
			
			for(var i=0, iLength = paths.length; i < iLength; i++) {	
				if(!data.children) data.children = {};

				if(!data.children[paths[i]]) {
					data.children[paths[i]] = {
						version: 0
					} 
				} 

				if(i === paths.length - 1) {
					if(typeof element == 'undefined' || element == null) {
						delete data.children[paths[i]];
					} else {
						data.children[paths[i]] = element;
					}
				} else {
					data = data.children[paths[i]];
				}
			}

			this.saveToLocalStorage();
		}

		serverUpdateData(path: string, element: any) {
			var data = this.getData(path, {versionUpdate: true});
			if(element) mergeRemoteData(data, element);
			this.saveToLocalStorage();
		}

		serverSetData(path: string, element: any) {
			var data = this.getData(path, {versionUpdate: true});
			data.children = {};
			if(element) mergeRemoteData(data, element);
			this.saveToLocalStorage();	
		}

		resetRegistry() {
			this._dataRegistry.value = null;
			this._dataRegistry.children = {};
			this._dataRegistry.version = 0;

			this.saveToLocalStorage();
		}

		saveToLocalStorage() {
			if(typeof localStorage !== 'undefined') {
				localStorage.setItem('LargeMouth_Registry_' + this._host, JSON.stringify(this._dataRegistry));
			}
		}

		persistSet(resource: SmallMouth.Resource, onComplete ?: (error) => any ) {
			this.persist('setRemote', resource._path, this.getData(resource._path), onComplete);
		}

		persistRemove(resource: SmallMouth.Resource, onComplete ?: (error) => any) {
			this.persist('removeRemote', resource._path, null, onComplete);
		}

		persist(method: string, path: string, data: any, onComplete ?: (error) => any) {
			this.saveToLocalStorage();

			this._largeMouthAdapter[method](
				data, 
				path, 
				onComplete
			);
		}

		public static getDataRegistry(host: string): DataRegistry {
			return SmallMouth.hosts[host].data;
		}
	}
}