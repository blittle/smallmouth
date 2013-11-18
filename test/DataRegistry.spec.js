describe("Data Registry", function() {

	var dataRegistry;
	var serverConnection;
	var eventRegistry;

	beforeEach(function() {
		eventRegistry = SmallMouth.makeEventRegistry('');
		serverConnection = SmallMouth.makeConnection('');
		dataRegistry = SmallMouth.makeDataRegistry('', serverConnection);
	});

	afterEach(function() {
		dataRegistry.resetRegistry();
		eventRegistry.resetRegistry();
	});

	it("Should initialize the registry with correctly", function() {
		expect(dataRegistry._dataRegistry).toBeDefined();
		expect(dataRegistry._dataRegistry.version).toBe(0);
		expect(dataRegistry._dataRegistry.data).toBeUndefined();
	});

	it("Should add a resource to the registry", function() {
		var resource1 = new SmallMouth.Resource('/resource1');
		expect(dataRegistry._dataRegistry.version).toBe(0);
		expect(dataRegistry._dataRegistry.children.resource1).toBeDefined();
		expect(dataRegistry._dataRegistry.children.resource1.version).toBe(0);
	});

	it("Should update the resource in the registry", function() {
		var resource1 = new SmallMouth.Resource('/resource1');
		var resource2 = new SmallMouth.Resource('/resource1');

		resource1.set('someValue');
		expect(resource1._getSnapshot().val()).toBe('someValue');
		expect(resource2._getSnapshot().val()).toBe('someValue');
	});

	it("Should create nested resources", function() {
		
		var resource1 = new SmallMouth.Resource('/some/data/for/you');
		expect(dataRegistry._dataRegistry.children.some.children.data.children.for.children.you).toBeDefined();
	});

	it("Should return the root registry if the path is an empty string", function() {
		var resource1 = new SmallMouth.Resource('/test/path');
		resource1.set('val');
		var resource = new SmallMouth.Resource('/');
		expect(resource._getSnapshot().val().test.path).toBe('val');
	});

	it('Should update the version when the value is modified', function() {
		var resource = new SmallMouth.Resource('/test');
		expect(resource._getSnapshot().version).toBe(0);
		resource.set("some value");
		expect(resource._getSnapshot().version).toBe(1);
		resource.set("some value 2");
		expect(resource._getSnapshot().version).toBe(2);
	});

	it('Should update a child\'s parent version', function() {
		var name1 = new SmallMouth.Resource('/chats/1234/name');
		var name2 = new SmallMouth.Resource('/chats/1235/name');
		var root = name1.root();

		name1.set('Joseph Smith');
		name2.set('Brigham Young');

		expect(root._getSnapshot().version).toBe(2);
	});

	it('Should return an array of versions for a particular path', function() {
		debugger;
		var resource1 = new SmallMouth.Resource('bism/allah/irahman/irahim');
		var resource2 = new SmallMouth.Resource('bism/allah/alhamdulillah');

		resource1.set('aiywa');
		resource2.set('kwayis');
		resource2.set('mumtaz');

		var versions = dataRegistry.getVersions('bism/allah/irahman/irahim');
		
		expect(versions[0]).toBe(3);
		expect(versions[1]).toBe(3);
		expect(versions[2]).toBe(3);
		expect(versions[3]).toBe(1);
	});
});