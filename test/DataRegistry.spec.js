describe("Data Registry", function() {

		afterEach(function() {
			SmallMouth._dataRegistry.resetRegistry();
			SmallMouth._eventRegistry.resetRegistry();
		});

		it("Should initialize the registry with correctly", function() {
			expect(SmallMouth._dataRegistry.dataRegistry).toBeDefined();
			expect(SmallMouth._dataRegistry.dataRegistry.version).toBe(0);
			expect(SmallMouth._dataRegistry.dataRegistry.data).toBeUndefined();
		});

		it("Should add a resource to the registry", function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/resource1');
			expect(SmallMouth._dataRegistry.dataRegistry.version).toBe(0);
			expect(SmallMouth._dataRegistry.dataRegistry.children.resource1).toBeDefined();
			expect(SmallMouth._dataRegistry.dataRegistry.children.resource1.version).toBe(0);
		});

		it("Should update the resource in the registry", function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/resource1');
			var resource2 = new SmallMouth.Resource('http://localhost:8080/resource1');

			resource1.set('someValue');
			expect(resource1._getSnapshot().val()).toBe('someValue');
			expect(resource2._getSnapshot().val()).toBe('someValue');
		});

		it("Should create nested resources", function() {
			
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data/for/you');
			expect(SmallMouth._dataRegistry.dataRegistry.children.some.children.data.children.for.children.you).toBeDefined();
		});

		it("Should return the root registry if the path is an empty string", function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/test/path');
			resource1.set('val');
			var resource = new SmallMouth.Resource('http://localhost:8080/');
			expect(resource._getSnapshot().val().test.path).toBe('val');
		});

		it('Should update the version when the value is modified', function() {
			var resource = new SmallMouth.Resource('http://localhost:8080/test');
			expect(resource._getSnapshot().version).toBe(0);
			resource.set("some value");
			expect(resource._getSnapshot().version).toBe(1);
			resource.set("some value 2");
			expect(resource._getSnapshot().version).toBe(2);
		});

		it('Should update a child\'s parent version', function() {
			var name1 = new SmallMouth.Resource('http://localhost:8080/chats/1234/name');
			var name2 = new SmallMouth.Resource('http://localhost:8080/chats/1235/name');
			var root = name1.root();

			name1.set('Joseph Smith');
			name2.set('Brigham Young');

			expect(root._getSnapshot().version).toBe(2);
		});
	});