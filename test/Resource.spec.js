describe('Resource', function() {
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


	it('Should trigger an event when on "value" for the initial value', function(run) {
		var spy = jasmine.createSpy('Spy for resource creation callback');
		var resource1 = new SmallMouth.Resource('/some');
		resource1.on('value', spy);
		
		expect(spy).toHaveBeenCalled();			
	});

	it('Should trigger an event on "value" for each call', function(run) {
		var spy = jasmine.createSpy('Spy for resource creation callback');
		var resource1 = new SmallMouth.Resource('/some');
		resource1.on('value', spy);
		resource1.on('value', spy);
		resource1.on('value', spy);
		resource1.on('value', spy);
		resource1.on('value', spy);
		resource1.on('value', spy);
		resource1.on('value', spy);
		
		expect(spy.calls.length).toBe(7);			
	});

	it('Should not trigger events when the same data is set', function() {
		var spy = jasmine.createSpy('Spy for set callback');
		var calls = 0;

		var resource1 = new SmallMouth.Resource('/some');
		resource1.set({hi: "test"});

		resource1.on('value', function() {
			calls++;
			called = true;
			spy();
		});

		resource1.set({hi: "test"});			
		
		expect(spy).toHaveBeenCalled();	
		expect(spy.calls.length).toBe(1);	
	});

	it('Should return children references', function() {
		var resource1 = new SmallMouth.Resource('/some/data/for/you');
		resource1.set('myData');
		var resource2 = new SmallMouth.Resource('/some/data');

		var resource3 = resource2.child('for/you');

		expect(resource1._getSnapshot().val()).toBe(resource3._getSnapshot().val());
	});

	it('Should return parent references', function() {
		var resource1 = new SmallMouth.Resource('/some/data/for/you');
		resource1.set('myData');
		var resource2 = new SmallMouth.Resource('/some/data/for');
		var resource3 = resource1.parent();

		expect(resource2._getSnapshot().val().you).toBe(resource3._getSnapshot().val().you);
	});

	it('Should return the root reference', function() {
		var resource1 = new SmallMouth.Resource('/some/data/for/you');
		var resource2 = resource1.root();
		var resource3 = new SmallMouth.Resource('/some');

		expect(resource2._getSnapshot().val().data.for.you).toBeNull();
		expect(resource3._getSnapshot().val().data.for.you).toBeNull();
	});

	it('Should return the resource name', function() {
		var resource1 = new SmallMouth.Resource('/some/data/for/you');
		var resource2 = new SmallMouth.Resource('/');
		var resource3 = new SmallMouth.Resource('/some/');
		expect(resource1.name()).toBe('you');
		expect(resource2.name()).toBe('');
		expect(resource3.name()).toBe('some');
	});

	it('Should return the resource path', function() {
		var resource1 = new SmallMouth.Resource('/some/data/for/you');
		var resource2 = new SmallMouth.Resource('/');
		var resource3 = new SmallMouth.Resource('/some/');
		expect(resource1.toString()).toBe('some/data/for/you');
		expect(resource2.toString()).toBe('');
		expect(resource3.toString()).toBe('some');
	});

	it('Should create nested resources and replace on set', function() {
		var resource1 = new SmallMouth.Resource('/some/data');

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
		var resource1 = new SmallMouth.Resource('/some/data');

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
		
		var resource1 = new SmallMouth.Resource('/some/data');

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
		var resource1 = new SmallMouth.Resource('/some/data');
		resource1.set('value');

		resource1.remove();

		expect(resource1._getSnapshot().val()).toBeNull();

		var parent = resource1.parent();
		var snapshot = parent._getSnapshot();

		expect(snapshot.val().data).toBeNull();
	});

	it('Should update parent resources version when a sub resource is removed', function() {
		var resource1 = new SmallMouth.Resource('/some/data');
		resource1.set('value');
		expect(resource1.parent()._getSnapshot().version).toBe(1);
		resource1.remove();
		expect(resource1.parent()._getSnapshot().version).toBe(2);
	});

	it('Should register and execute events on value set', function() {
		var resource1 = new SmallMouth.Resource('/data');
		var spy = jasmine.createSpy();

		resource1.on('value', spy);
		resource1.set('something');
		expect(spy).toHaveBeenCalled();
	});

	it('Should register and execute events on value update', function() {
		var resource1 = new SmallMouth.Resource('/data');
		var spy = jasmine.createSpy();

		resource1.on('value', spy);
		resource1.update('something');
		expect(spy).toHaveBeenCalled();
	});

	it('On an event callback, should pass a snapshot of the data', function() {
		var resource1 = new SmallMouth.Resource('/data');
		var spy = jasmine.createSpy();

		var callback = function(snapshot) {
			spy(snapshot.val());
		};

		resource1.on('value', callback);
		resource1.set('something');
		expect(spy).toHaveBeenCalledWith('something');
	});

	it('On an event callback, should pass a parent snapshot of data', function() {
		var resource1 = new SmallMouth.Resource('/deep');
		var resource2 = new SmallMouth.Resource('/deep/in/the/greenwood/the/animals/play');

		var spy = jasmine.createSpy();

		resource1.on('value', spy);
		resource2.set('hop like a bunny');

		expect(spy).toHaveBeenCalled();
		var snapshot = spy.mostRecentCall.args[0];
		expect(snapshot.child('in/the/greenwood/the/animals/play').val()).toBe('hop like a bunny');
	});

	it('When a resource is removed, "value" event should get fired', function() {
		var top = new SmallMouth.Resource('top');
		var child = new SmallMouth.Resource('top/child');

		child.set('someValue');

		var spy1 = jasmine.createSpy();
		var spy2 = jasmine.createSpy();

		top.on('value', spy1);
		child.on('value', spy2);

		child.remove();

		expect(spy1).toHaveBeenCalled();
		expect(spy2).toHaveBeenCalled();

		expect(spy1.mostRecentCall.args[0].val().child).toBe(null);
		expect(spy2.mostRecentCall.args[0].val()).toBe(null);
	});

	it('Should create child references', function() {
		var chats = new SmallMouth.Resource('chats');

		var chat1 = chats.push();
		chat1.name();

		var snapshot = chats._getSnapshot();
		expect(snapshot._data.children[chat1.name()]).toBeDefined();
	});

	it('Should create child references with data', function() {
		var chats = new SmallMouth.Resource('chats');

		var chat1 = chats.push("My name!");
		chat1.name();

		var snapshot = chats._getSnapshot();
		expect(snapshot._data.children[chat1.name()]).toBeDefined();
		expect(snapshot._data.children[chat1.name()].value).toBe('My name!');
	});

	it('Should unregister events', function() {
		var func = function() {}

		var chats = new SmallMouth.Resource('chats');

		chats.on('value', func);

		expect(SmallMouth._eventRegistry.eventRegistry.children.chats.events.value.length).toBe(1);

		chats.off('value', func);

		expect(SmallMouth._eventRegistry.eventRegistry.children.chats.events.value.length).toBe(0);

		chats.on('value', func);
		chats.on('value', func);

		expect(SmallMouth._eventRegistry.eventRegistry.children.chats.events.value.length).toBe(2);

		chats.off('value');

		expect(SmallMouth._eventRegistry.eventRegistry.children.chats.events.value.length).toBe(0);

		chats.on('value', func);
		chats.on('value', func);

		expect(SmallMouth._eventRegistry.eventRegistry.children.chats.events.value.length).toBe(2);

		chats.off();

		expect(SmallMouth._eventRegistry.eventRegistry.children.chats.events.value).not.toBeDefined();
	});
});