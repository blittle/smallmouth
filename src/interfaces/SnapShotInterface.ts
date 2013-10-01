import SmallMouthInterface = require('SmallMouthInterface');

interface SnapShotInterface {
	val(): any;
	child(path: string): SnapShotInterface;
	forEach(childAction: (childSnapshot: SnapShotInterface) => any): boolean;	
	hasChild( childPath: string ): boolean;
	hasChildren(): boolean;
	name(): string;
	numChildren(): number;
	ref(): SmallMouthInterface;
	getPriority(): any;
	exportVal(): any;
}

export = SnapShotInterface;