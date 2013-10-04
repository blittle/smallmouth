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
	}
}