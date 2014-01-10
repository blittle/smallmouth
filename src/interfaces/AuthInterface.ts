///<reference path="SimpleLoginInterface"/>

module SmallMouth {
	export interface AuthInterface {
		authToken?: string;
		type?: string;
		options?: SmallMouth.SimpleLoginOptions;
	}
}