module SmallMouth {

	export interface SimpleLoginOptions {
		username: string;
		password: string;
		rememberMe: string;
	}

	export interface SimpleLoginUser {
		email: string;
		authToken: string;
		id: string;
		md5_hash: string;
		provider: string;
		uid: string;
	}

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