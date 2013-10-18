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

	function updateRegistry(resource: SmallMouth.Resource, value: any, options: any = {}) {
		var data = getData(resource._path, {versionUpdate: true});

		if(!options.merge) {
			data.children = {};
			data.value = null;
		}

		createSubDataFromObject(data, value);

		data.version++;
		sync(resource);
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
		var data = getData(resource._path);
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