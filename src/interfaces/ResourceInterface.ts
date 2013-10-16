///<reference path="SnapshotInterface"/>
///<reference path="ServerValueInterface"/>
module SmallMouth {

	export interface ResourceInterface {
		 on( eventType: string, callback: (snapshot: SmallMouth.SnapshotInterface, previusChild ?: string) => any, cancelCallbck ?: Function, context ?: any ): ResourceInterface;
		 on( eventType: string, callback: (snapshot: SmallMouth.SnapshotInterface, previusChild ?: string) => any, context ?: any ): ResourceInterface;
		 off( eventType: string, callback ?: Function, context ?: any ): ResourceInterface;
		 
		 set( value: any, onComplete ?: (error) => any ): ResourceInterface;
		 update( value: any, onComplete ?: (error) => any ): ResourceInterface;
		 push( value: any, complete ?: (error) => any ): ResourceInterface;
		 remove( onComplete?: (error) => any ): void;

		 child( childPath: string ): ResourceInterface;
		 parent(): ResourceInterface;
		 root(): ResourceInterface;
		 name(): string;
		 toString(): string;
		 
		 /**
		 auth( authToken, onSuccess ?: (error, result) => any ): ResourceInterface;
		 unauth(): ResourceInterface;
		 
		 setWithPriority( value: any, priority: any, onComplete ?: (error) => any ): ResourceInterface;
		 setPriority( priority: any, onComplete ?: (error) => any ): ResourceInterface;
		 transaction( updateFunction : (data: any) => any, onComplete ?: (error, commited: boolean, snapshot: SnapShotInterface) => any, applyLocally ?: boolean );
		 
		 
		 once( eventType: string, successCallback: (snapshot: SnapShotInterface, previusChild ?: string) => any, failureCallback ?: Function, context?: any );
		 limit( limit: number ): ResourceInterface;
		 startAt( priority ?: any, name ?: string ): ResourceInterface;
		 endAt( priority ?: any, name ?: string ): ResourceInterface;

		 ref(): ResourceInterface;
		 onDisconnect(): ResourceInterface;

		 ServerValue: ServerValueInterface;
		 **/
	}
}

