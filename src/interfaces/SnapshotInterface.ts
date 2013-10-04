///<reference path="SmallMouthInterface"/>

module SmallMouth {
	export interface SnapshotInterface {
		val(): any;
		child(path: string): SnapshotInterface;
		forEach(childAction: (childSnapshot: SnapshotInterface) => any): boolean;	
		hasChild( childPath: string ): boolean;
		hasChildren(): boolean;
		name(): string;
		numChildren(): number;
		ref(): SmallMouth.SmallMouthInterface;
		// getPriority(): any;
		// exportVal(): any;
	}	
}

