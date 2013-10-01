describe("SmallMouth", function() {

	describe("Data Registry", function() {

		afterEach(function() {
			SmallMouth._registry.resetRegistry();
		});

		it("Should initialize the registry with correctly", function() {
			expect(SmallMouth._registry.dataRegistry).toBeDefined();
			expect(SmallMouth._registry.dataRegistry.version).toBe(0);
			expect(SmallMouth._registry.dataRegistry.data).toBeNull();
		});

		it("Should add a resource to the registry", function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/resource1');
			expect(SmallMouth._registry.dataRegistry.version).toBe(0);
			expect(SmallMouth._registry.dataRegistry.children.resource1).toBeDefined();
			expect(SmallMouth._registry.dataRegistry.children.resource1.version).toBe(0);
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

		it("Should create nested resources", function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data/for/you');
			expect(SmallMouth._registry.dataRegistry.children.some.children.data.children.for.children.you).toBeDefined();
		});
	});

	describe('Resource', function() {
		afterEach(function() {
			SmallMouth._registry.resetRegistry();
		});

		it('Should return children references', function() {
			// var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data/for/you');
			// resource1.set('myData');
			// var resource2 = new SmallMouth.Resource('http://localhost:8080/some/data');

			// var resource3 = resource2.child('for/you');

			// expect(resource1._getSnapshot()).toBe(resource3._getSnapshot());
		});

		it('Should return parent references', function() {

		});
	});

	it("Should pass", function() {
		expect(1).toBe(1);
	});

});