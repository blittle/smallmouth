///<reference path="ResourceInterface"/>

module SmallMouth {
	export interface SnapshotInterface {
		val(): any;
		child(path: string): SnapshotInterface;
		forEach(childAction: (childSnapshot: SnapshotInterface) => any): boolean;	
		hasChild( childPath: string ): boolean;
		hasChildren(): boolean;
		name(): string;
		numChildren(): number;
		ref(): SmallMouth.ResourceInterface;
		// getPriority(): any;
		// exportVal(): any;
	}	
}

