///<reference path="interfaces/SimpleLoginInterface"/>

module SmallMouth {

	export class SimpleLogin {
		res: SmallMouth.Resource;
		onComplete: SmallMouth.onCompleteSignature 

		constructor(
			res: SmallMouth.Resource, 
			onComplete : SmallMouth.onCompleteSignature
		) {
			this.res = res;
			this.onComplete = onComplete;
		}

		login(type: string, options: SimpleLoginOptions): SimpleLogin {
			this.res.authenticateConnection(type, options, this.onComplete);
			return this;
		}
	}
}