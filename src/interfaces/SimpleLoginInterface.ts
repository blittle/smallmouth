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
}