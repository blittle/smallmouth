module SmallMouth {

	var syncTimeout;

	var dataRegistry = JSON.parse(localStorage.getItem('LargeMouth_Registry')) || {
		data: null,
		children: {},
		version: 0
	};

	function createSubDataFromObject(data, obj) {
		if(obj instanceof Object && !(obj instanceof String) && !(obj instanceof Number) && !(obj instanceof Array) && !(obj instanceof Boolean) ) {
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
			if(!data.children[paths[i]]) {
				data.children[paths[i]] = {
					children: {},
					version: 0
				} 
			} 

			if(options.versionUpdate) data.version++;

			data = data.children[paths[i]];
		}

		return data;
	}

	function updateRegistry(resource, value: any) {
		var data = getData(resource._path, {versionUpdate: true});


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
		if(syncTimeout) clearTimeout(syncTimeout);

		syncTimeout = setTimeout(()=> {
			localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
		}, 100);
	}

	function resetRegistry() {
		dataRegistry.data = null;
		dataRegistry.children = {};
		dataRegistry.version = 0;

		localStorage.setItem('LargeMouth_Registry', JSON.stringify(dataRegistry));
	}

	export var _registry = {
		sync: sync,
		initializeRegistry: initializeRegistry,
		updateRegistry: updateRegistry,
		getData: getData,
		dataRegistry: dataRegistry,
		resetRegistry: resetRegistry
	}
}