module SmallMouth {
	export interface ServerAdapter {
		connect( host: string ): ServerAdapter;
		subscribe( url: string ): ServerAdapter;
		syncRemote(data, url: string, onComplete ?: (error) => any): ServerAdapter;
		generateId(): string;
	}
}