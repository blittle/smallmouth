///<reference path="interfaces/SnapshotInterface"/>
///<reference path="interfaces/ResourceInterface"/>

module SmallMouth {

	function getJSON(data) {
		var obj = {};

		if(typeof data.value !== 'undefined' && data.value != null) {
			return data.value;
		} else if(!data.children || !Object.keys(data.children).length ) {
			return null;
		} else {
			for(var key in data.children) {
				if(data.children.hasOwnProperty(key)) {
					obj[key] = getJSON(data.children[key]);
				}
			}
		} 

		return obj;
	}

	export class Snapshot implements SmallMouth.SnapshotInterface {
		private _path;
		private _data;
		private _host;
		public version;

		constructor(path, data, host) {
			this._path = path;
			this._host = host;

			// Deep copy the data by serializing it to JSON.
			// This is necesary so the class remains a 'snapshot' of 
			// the data and doesn't change as the future resource does
			this._data = JSON.parse(JSON.stringify(data));
			this.version = data.version;
		}

		val(): any {
			return getJSON(this._data);
		}

		child(path: string): Snapshot {

			path = this._path + '/' + Resource.cleanPath(path);

			var data = SmallMouth.DataRegistry.getDataRegistry(this._host).getData(path);

			if(!data) return undefined;

			return new Snapshot(
				path,
				data,
				this._host
			);		
		}

		forEach(childAction: (childSnapshot: SnapshotInterface) => any): boolean {
			var children = this._data.children;

			for(var key in children) {
				if(children.hasOwnProperty(key)) {
					var path = this._path + '/' + key;

					var cancel = childAction.call(this, 
						new Snapshot(
							path, SmallMouth.DataRegistry.getDataRegistry(this._host).getData(path), this._host
						)
					);

					if(cancel) return true;
				}
			}

			return false;
		}

		hasChild( childPath: string ): boolean {
			childPath = this._path + '/' + SmallMouth.Resource.cleanPath(childPath);
			var data = SmallMouth.DataRegistry.getDataRegistry(this._host).getData(childPath);
			return typeof data.children !== 'undefined' || typeof data.value !== 'undefined';
		}

		hasChildren(): boolean {
			return this.numChildren() > 0;
		}

		name(): string {
			return this._path.substring(this._path.lastIndexOf('/')+1);
		}
		
		numChildren(): number {
			return this._data.children ? Object.keys(this._data.children).length : 0;
		}

		ref(): SmallMouth.Resource {
			return new SmallMouth.Resource(this._host + '/' + this._path);
		}
	}
}