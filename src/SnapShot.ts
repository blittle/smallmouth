///<reference path="interfaces/SnapshotInterface"/>

module SmallMouth {

	function getJSON(data) {
		var obj = {};

		if(data.data) {
			return data.data;
		} else if(!data.children) {
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
		public version;

		constructor(path, data) {
			this._path = path;
			this._data = data;
			this.version = data.version;
		}

		val(): any {
			return getJSON(this._data);
		}

		child(path: string): Snapshot {

			path = this._path + '/' + Resource.cleanPath(path);

			var data = SmallMouth._registry.getData(path);

			if(!data) return undefined;

			return new SmallMouth.Snapshot(
				path,
				data
			);		
		}

		forEach(childAction: (childSnapshot: SnapshotInterface) => any): boolean {
			var children = this._data.children;

			for(var key in children) {
				if(children.hasOwnProperty(key)) {
					var path = this._path + '/' + key;

					var cancel = childAction.call(this, 
						new SmallMouth.Snapshot(
							path, SmallMouth._registry.getData(path)
						)
					);

					if(cancel) return true;
				}
			}

			return false;
		}
	}
}