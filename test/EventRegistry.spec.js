describe("Event Registry", function() {

		var dataRegistry;
		var serverConnection;

		beforeEach(function() {
			serverConnection = SmallMouth.makeConnection('');
			dataRegistry = SmallMouth.makeDataRegistry('', serverConnection);
		});

		afterEach(function() {
			dataRegistry.resetRegistry();
			SmallMouth._eventRegistry.resetRegistry();
		});

		it('Should initialize the registry correctly', function() {
			expect(Object.keys(SmallMouth._eventRegistry.eventRegistry.children).length).toBe(0);
			expect(Object.keys(SmallMouth._eventRegistry.eventRegistry.events).length).toBe(0);
		});

		it('Should add events to the registry', function() {
			SmallMouth._eventRegistry.addEvent('resource1', 'value', function() {});
			expect(SmallMouth._eventRegistry.eventRegistry.children.resource1.events.value.length).toBe(1);
		});

		it('Should remove events from the registry', function() {
			var func = function() {};

			SmallMouth._eventRegistry.addEvent('resource1', 'value', func);
			expect(SmallMouth._eventRegistry.eventRegistry.children.resource1.events.value.length).toBe(1);

			SmallMouth._eventRegistry.removeEvent('resource1', 'value', func);
			expect(SmallMouth._eventRegistry.eventRegistry.children.resource1.events.value.length).toBe(0);
		});

		it('Should clear all events when only the path and value are given', function() {
			var func1 = function() {};
			var func2 = function() {};
			var func3 = function() {};

			SmallMouth._eventRegistry.addEvent('resource1', 'value', func1);
			SmallMouth._eventRegistry.addEvent('resource1', 'value', func2);
			SmallMouth._eventRegistry.addEvent('resource1', 'value', func3);

			expect(SmallMouth._eventRegistry.eventRegistry.children.resource1.events.value.length).toBe(3);

			SmallMouth._eventRegistry.removeEvent('resource1', 'value');
			expect(SmallMouth._eventRegistry.eventRegistry.children.resource1.events.value.length).toBe(0);
		});

		it('Should clear all events when only the path is given', function() {
			var func1 = function() {};
			var func2 = function() {};
			var func3 = function() {};

			SmallMouth._eventRegistry.addEvent('resource1', 'value', func1);
			SmallMouth._eventRegistry.addEvent('resource1', 'value', func2);
			SmallMouth._eventRegistry.addEvent('resource1', 'value', func3);

			expect(SmallMouth._eventRegistry.eventRegistry.children.resource1.events.value.length).toBe(3);

			debugger;
			SmallMouth._eventRegistry.removeEvent('resource1');
			expect(SmallMouth._eventRegistry.eventRegistry.children.resource1.events.value).not.toBeDefined();
		});

		it('Shouldn\'t error removing events that don\'t exist', function() {
			SmallMouth._eventRegistry.removeEvent('resource1', 'value', function() {});
			//Shouldn't error 
			expect(true).toBe(true);
		});

		it('Should trigger events', function() {
			var spy = jasmine.createSpy();
			SmallMouth._eventRegistry.addEvent('resource1', 'value', spy);
			SmallMouth._eventRegistry.triggerEvent('resource1', 'value');
			expect(spy).toHaveBeenCalled();
		});

		it('Should not error when trigger events that don\'t exist', function() {
			SmallMouth._eventRegistry.triggerEvent('does/not/exist', 'value');
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

			SmallMouth._eventRegistry.addEvent('resource1', 'value', callback, context);
			SmallMouth._eventRegistry.triggerEvent('resource1', 'value', null, 'someSnapshot');
			expect(context.spy).toHaveBeenCalled();
			expect(context.spy).toHaveBeenCalledWith('someSnapshot');
		});

		it('Should trigger events on parent resources', function() {
			var spy1 = jasmine.createSpy('parent resource spy');
			var spy2 = jasmine.createSpy('child resource spy');

			SmallMouth._eventRegistry.addEvent('resource1', 'value', spy1);
			SmallMouth._eventRegistry.addEvent('resource1/some/path/deep', 'value', spy2);
			SmallMouth._eventRegistry.triggerEvent('resource1/some/path/deep', 'value', '', 'someSnapshot');

			expect(spy1).toHaveBeenCalled();
			expect(spy2).toHaveBeenCalled();

			expect(spy1.mostRecentCall.args[0].val()).toBe(null);
			expect(spy2).toHaveBeenCalledWith('someSnapshot', {});
		});

	});