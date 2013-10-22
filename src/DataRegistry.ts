module SmallMouth._dataRegistry {	

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

	var dataRegistry = JSON.parse(localStorage.getItem('LargeMouth_Registry')) || {
		version: 0
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
			data.value = obj;
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

	function updateRegistry(resource: SmallMouth.Resource, value: any, options: any = {}): boolean {
		var data = getData(resource._path);

		var dataCache = JSON.parse(JSON.stringify(data));

		if(!options.merge) {
			data.children = {};
			data.value = null;
		}

		createSubDataFromObject(data, value);

		if(!isEqual(data, dataCache)) {
			var data = getData(resource._path, {versionUpdate: true});
			data.version++;
			sync(resource);
			return true;
		}

		return false;
	}

	function serverUpdateData(path: string, element: any) {
		var data = getData(path, {versionUpdate: true});
		if(element) _mergeRemoteData(data, element);
		localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
	}

	function serverSetData(path: string, element: any) {
		var data = getData(path, {versionUpdate: true});
		data.children = {};
		if(element) _mergeRemoteData(data, element);
		localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));	
	}

	function _mergeRemoteData(local, remote) {
		local.version = remote.version;

		if(remote.value) local.value = remote.value;
		else {
			if(!local.children) local.children = {};

			for(var el in remote.children) {
				if(remote.children.hasOwnProperty(el)) {
					if(!local.children[el]) {
						local.children[el] = {
							version: 0
						}
					} 

					_mergeRemoteData(local.children[el], remote.children[el]);
				}
			}
		}
	}

	function initializeRegistry(resource: SmallMouth.Resource) {
		return getData(resource._path);
	}

	function sync(resource: SmallMouth.Resource) {
		// if(syncTimeout) clearTimeout(syncTimeout);

		// syncTimeout = setTimeout(()=> {
		localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));

		if(resource._host) {
			SmallMouth.largeMouthAdapter.syncRemote(resource._host, getData(resource._path), resource._path);
		}

		// }, 100);
	}

	function resetRegistry() {
		dataRegistry.value = null;
		dataRegistry.children = {};
		dataRegistry.version = 0;

		localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
	}

	function remove(resource: SmallMouth.Resource) {
		var path = resource._path;

		if(path.trim() == '') return dataRegistry;

		var paths = path.split('/');
		var data = dataRegistry;
		
		for(var i=0, iLength = (paths.length - 1); i < iLength; i++) {	
			if(!data.children) break;
			data = data.children[paths[i]];
			data.version++;
		}			

		delete data.children;
		delete data.value;

		if(resource._host) sync(resource);		
	}

	function getVersions(path) {
		var paths = path.split('/');
		var data = dataRegistry;

		var versions = [];

		for(var i=0, iLength = paths.length; i < iLength; i++) {	
			if(!data) break;
			versions.push(data.version);
			if(!data.children) break;
			data = data.children[paths[i]];
		}

		return versions;
	}

	export var initializeRegistry = initializeRegistry;
	export var updateRegistry = updateRegistry;
	export var getData = getData;
	export var dataRegistry = dataRegistry;
	export var resetRegistry = resetRegistry;
	export var remove = remove;
	export var getVersions = getVersions;
	export var serverUpdateData = serverUpdateData;
	export var serverSetData = serverSetData;
}