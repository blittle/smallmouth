///<reference path="SnapShotInterface"/>
///<reference path="ServerValueInterface"/>
module SmallMouth {

	export interface SmallMouthInterface {
		 on( eventType: string, callback: (snapshot: SmallMouth.SnapShotInterface, previusChild ?: string) => any, cancelCallbck ?: Function, context ?: any ): SmallMouthInterface;
		 set( value: any, onComplete ?: (error) => any ): SmallMouthInterface;
		 child( childPath: string ): SmallMouthInterface;
		 parent(): SmallMouthInterface;
		 root(): SmallMouthInterface;
		 name(): string;
		 toString(): string;
		 update( value: any, onComplete ?: (error) => any ): SmallMouthInterface;
		 /**
		 auth( authToken, onSuccess ?: (error, result) => any ): SmallMouthInterface;
		 unauth(): SmallMouthInterface;
		 
		 
		 remove( onComplete?: (error) => any ): SmallMouthInterface;
		 push( value: any, complete ?: (error) => any ): SmallMouthInterface;
		 setWithPriority( value: any, priority: any, onComplete ?: (error) => any ): SmallMouthInterface;
		 setPriority( priority: any, onComplete ?: (error) => any ): SmallMouthInterface;
		 transaction( updateFunction : (data: any) => any, onComplete ?: (error, commited: boolean, snapshot: SnapShotInterface) => any, applyLocally ?: boolean );
		 
		 off( eventType: string, callback ?: Function, context ?: any );
		 once( eventType: string, successCallback: (snapshot: SnapShotInterface, previusChild ?: string) => any, failureCallback ?: Function, context?: any );
		 limit( limit: number ): SmallMouthInterface;
		 startAt( priority ?: any, name ?: string ): SmallMouthInterface;
		 endAt( priority ?: any, name ?: string ): SmallMouthInterface;

		 ref(): SmallMouthInterface;
		 onDisconnect(): SmallMouthInterface;

		 ServerValue: ServerValueInterface;
		 **/
	}
}

