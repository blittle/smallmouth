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
		onComplete: (error: any, user: SimpleLoginUser) => any; 

		constructor(
			res: SmallMouth.Resource, 
			onComplete : (error: any, user: SimpleLoginUser) => any
		) {
			this.res = res;
		}

		login(type: string, options: SimpleLoginOptions): SimpleLogin {
			this.res.auth
			return this;
		}
	}
}