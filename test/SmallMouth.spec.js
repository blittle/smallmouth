describe("SmallMouth", function() {

	describe("Data Registry", function() {

		afterEach(function() {
			SmallMouth.resetRegistry();
		})

		it("Should initialize the registry with correctly", function() {
			expect(SmallMouth.dataRegistry).toBeDefined();
			expect(SmallMouth.dataRegistry.version).toBe(0);
			expect(SmallMouth.dataRegistry.data).toBeNull();
		});

		it("Should add a resource to the registry", function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/resource1');
			expect(SmallMouth.dataRegistry.version).toBe(0);
			expect(SmallMouth.dataRegistry.children.resource1).toBeDefined();
			expect(SmallMouth.dataRegistry.children.resource1.version).toBe(0);
		});

		it("Multiple references should point to the same object", function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/resource1');
			var resource2 = new SmallMouth.Resource('http://localhost:8080/resource1');

			expect(resource1._getSnapshot().data).toBe(resource2._getSnapshot().data);
		});

		it("Should update the resource in the registry", function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/resource1');
			var resource2 = new SmallMouth.Resource('http://localhost:8080/resource1');

			resource1.set('someValue');
			expect(resource1._getSnapshot().data).toBe('someValue');
			expect(resource2._getSnapshot().data).toBe('someValue');
		});
	});

	it("Should pass", function() {
		expect(1).toBe(1);
	});

});