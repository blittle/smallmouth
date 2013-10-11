module SmallMouth._dataRegistry {	

	var syncTimeout;

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

	function updateRegistry(path, value: any, options: any = {}) {
		var data = getData(path, {versionUpdate: true});

		if(!options.merge) {
			data.children = {};
			data.data = null;
		}

		createSubDataFromObject(data, value);

		data.version++;

		sync(path);
	}

	function initializeRegistry(resource) {
		var data = getData(resource._path);

		sync(resource._path);		
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

	export var initializeRegistry = initializeRegistry;
	export var updateRegistry = updateRegistry;
	export var getData = getData;
	export var dataRegistry = dataRegistry;
	export var resetRegistry = resetRegistry;
	export var remove = remove;
	
}