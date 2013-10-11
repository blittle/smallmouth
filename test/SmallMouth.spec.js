describe("SmallMouth", function() {

	describe("Data Registry", function() {

		afterEach(function() {
			SmallMouth._registry.resetRegistries();
		});

		it("Should initialize the registry with correctly", function() {
			expect(SmallMouth._registry.dataRegistry).toBeDefined();
			expect(SmallMouth._registry.dataRegistry.version).toBe(0);
			expect(SmallMouth._registry.dataRegistry.data).toBeUndefined();
		});

		it("Should add a resource to the registry", function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/resource1');
			expect(SmallMouth._registry.dataRegistry.version).toBe(0);
			expect(SmallMouth._registry.dataRegistry.children.resource1).toBeDefined();
			expect(SmallMouth._registry.dataRegistry.children.resource1.version).toBe(0);
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
			expect(SmallMouth._registry.dataRegistry.children.some.children.data.children.for.children.you).toBeDefined();
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

	describe("Event Registry", function() {

		afterEach(function() {
			SmallMouth._registry.resetRegistries();
		});

		it('Should initialize the registry correctly', function() {
			expect(Object.keys(SmallMouth._registry.eventRegistry.children).length).toBe(0);
			expect(Object.keys(SmallMouth._registry.eventRegistry.events).length).toBe(0);
		});

		it('Should add events to the registry', function() {
			SmallMouth._registry.addEvent('resource1', 'value', function() {});
			expect(SmallMouth._registry.eventRegistry.children.resource1.events.value.length).toBe(1);
		});

		it('Should remove events from the registry', function() {
			var func = function() {};

			SmallMouth._registry.addEvent('resource1', 'value', func);
			expect(SmallMouth._registry.eventRegistry.children.resource1.events.value.length).toBe(1);

			SmallMouth._registry.removeEvent('resource1', 'value', func);
			expect(SmallMouth._registry.eventRegistry.children.resource1.events.value.length).toBe(0);
		});

		it('Shouldn\'t error removing events that don\'t exist', function() {
			SmallMouth._registry.removeEvent('resource1', 'value', function() {});
			//Shouldn't error 
			expect(true).toBe(true);
		});

		it('Should trigger events', function() {
			var spy = jasmine.createSpy();
			SmallMouth._registry.addEvent('resource1', 'value', spy);
			SmallMouth._registry.triggerEvent('resource1', 'value');
			expect(spy).toHaveBeenCalled();
		});

		it('Should not error when trigger events that don\'t exist', function() {
			SmallMouth._registry.triggerEvent('does/not/exist', 'value');
			//Shouldn't error 
			expect(true).toBe(true);
		});

		it('Should trigger events in the right context', function() {
			var context = {
				spy: jasmine.createSpy()
			};

			var callback = function(snapshot) {
				this.spy(snapshot);
			};

			SmallMouth._registry.addEvent('resource1', 'value', callback, context);
			SmallMouth._registry.triggerEvent('resource1', 'value', null, 'someSnapshot');
			expect(context.spy).toHaveBeenCalled();
			expect(context.spy).toHaveBeenCalledWith('someSnapshot');
		});

		it('Should trigger events on parent resources', function() {
			var spy1 = jasmine.createSpy('parent resource spy');
			var spy2 = jasmine.createSpy('child resource spy');

			SmallMouth._registry.addEvent('resource1', 'value', spy1);
			SmallMouth._registry.addEvent('resource1/some/path/deep', 'value', spy2);
			SmallMouth._registry.triggerEvent('resource1/some/path/deep', 'value', null, 'someSnapshot');

			expect(spy1).toHaveBeenCalled();
			expect(spy2).toHaveBeenCalled();

			expect(spy1.mostRecentCall.args[0].val()).toBe(null);
			expect(spy2).toHaveBeenCalledWith('someSnapshot');
		});

	});

	describe('Resource', function() {
		afterEach(function() {
			SmallMouth._registry.resetRegistries();
		});

		it('Should return children references', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data/for/you');
			resource1.set('myData');
			var resource2 = new SmallMouth.Resource('http://localhost:8080/some/data');

			var resource3 = resource2.child('for/you');

			expect(resource1._getSnapshot().val()).toBe(resource3._getSnapshot().val());
		});

		it('Should return parent references', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data/for/you');
			resource1.set('myData');
			var resource2 = new SmallMouth.Resource('http://localhost:8080/some/data/for');
			var resource3 = resource1.parent();

			expect(resource2._getSnapshot().val().you).toBe(resource3._getSnapshot().val().you);
		});

		it('Should return the root reference', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data/for/you');
			var resource2 = resource1.root();
			var resource3 = new SmallMouth.Resource('http://localhost:8080/some');

			expect(resource2._getSnapshot().val().data.for.you).toBeNull();
			expect(resource3._getSnapshot().val().data.for.you).toBeNull();
		});

		it('Should return the resource name', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data/for/you');
			var resource2 = new SmallMouth.Resource('http://localhost:8080/');
			var resource3 = new SmallMouth.Resource('http://localhost:8080/some/');
			expect(resource1.name()).toBe('you');
			expect(resource2.name()).toBe('');
			expect(resource3.name()).toBe('some');
		});

		it('Should return the resource path', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data/for/you');
			var resource2 = new SmallMouth.Resource('http://localhost:8080/');
			var resource3 = new SmallMouth.Resource('http://localhost:8080/some/');
			expect(resource1.toString()).toBe('some/data/for/you');
			expect(resource2.toString()).toBe('');
			expect(resource3.toString()).toBe('some');
		});

		it('Should create nested resources and replace on set', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data');

			resource1.set({
				'prop1': 1
			});

			resource1.set({
				'prop2': {
					sub1: 1,
					sub2: 2
				}
			});			

			expect(resource1.child('prop1')._getSnapshot().val()).toBeNull();

			expect(resource1.child('prop2/sub1')._getSnapshot().val()).toBe(1);
			expect(resource1.child('prop2/sub2')._getSnapshot().val()).toBe(2);
		});

		it('Should create nested resources and merge on update', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data');

			resource1.set({
				'prop1': 1
			});

			resource1.update({
				'prop2': {
					sub1: 1,
					sub2: 2
				}
			});

			expect(resource1.child('prop1')).toBeDefined();
			expect(resource1.child('prop1')._getSnapshot().val()).toBe(1);

			expect(resource1.child('prop2/sub1')._getSnapshot().val()).toBe(1);
			expect(resource1.child('prop2/sub2')._getSnapshot().val()).toBe(2);
		});

		it('Should update parent versions when nested resources are set', function() {
			
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data');

			resource1.set({
				'prop1': {
					'sub1': 1
				}
			});

			resource1.set({
				'prop1': {
					'sub2': 2
				}
			});				
			
			expect(resource1.child('prop1/sub2')._getSnapshot().val()).toBe(2);
			expect(resource1.child('prop1')._getSnapshot().version).toBe(0);
			expect(resource1._getSnapshot().version).toBe(2);		
		});

		it('Should remove resource', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data');
			resource1.set('value');

			resource1.remove();

			expect(resource1._getSnapshot().val()).toBeNull();

			var parent = resource1.parent();
			var snapshot = parent._getSnapshot();

			expect(snapshot.val().data).toBeNull();
		});

		it('Should update parent resources version when a sub resource is removed', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/some/data');
			resource1.set('value');
			expect(resource1.parent()._getSnapshot().version).toBe(1);
			resource1.remove();
			expect(resource1.parent()._getSnapshot().version).toBe(2);
		});

		it('Should register and execute events on value change', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/data');
			var spy = jasmine.createSpy();

			resource1.on('value', spy);
			resource1.set('something');
			expect(spy).toHaveBeenCalled();
		});

		it('On an event callback, should pass a snapshot of the data', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/data');
			var spy = jasmine.createSpy();

			var callback = function(snapshot) {
				spy(snapshot.val());
			};

			resource1.on('value', callback);
			resource1.set('something');
			expect(spy).toHaveBeenCalledWith('something');
		});

		it('On an event callback, should pass a parent snapshot of data', function() {
			var resource1 = new SmallMouth.Resource('http://localhost:8080/deep');
			var resource2 = new SmallMouth.Resource('http://localhost:8080/deep/in/the/greenwood/the/animals/play');

			var spy = jasmine.createSpy();

			resource1.on('value', spy);
			resource2.set('hop like a bunny');

			expect(spy).toHaveBeenCalled();
			var snapshot = spy.mostRecentCall.args[0];
			expect(snapshot.child('in/the/greenwood/the/animals/play').val()).toBe('hop like a bunny');
		});
	});
});