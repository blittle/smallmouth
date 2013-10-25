describe("Snapshot", function() {
	var resource;

	beforeEach(function(){
		resource = new SmallMouth.Resource('http://localhost:8080/data');
		resource.set('value');
	});

	it('Should return a value', function() {
		resource.set('12');
		expect(resource._getSnapshot().val()).toBe('12');

		resource.set({test: 'hi'});
		expect(resource._getSnapshot().val().test).toBe('hi');
	});

	it('Should return a \'snapshot\' value that doesn\'t change as the resource is changed', function() {
		var snapshot = resource._getSnapshot();
		expect(snapshot.val()).toBe('value');

		resource.set('some other value');
		expect(snapshot.val()).toBe('value');
		expect(resource._getSnapshot().val()).toBe('some other value');
	});

	it('Should return children', function() {
		resource.set({'path': 1});

		var snapshot = resource._getSnapshot().child('path');
		expect(snapshot.val()).toBe(1);
	});

	it('Should loop through foreach', function() {
		resource.set({
			'1': 1,
			'2': 2,
			'3': 3
		});

		var snapshot = resource._getSnapshot();
		var results = [];

		var result = snapshot.forEach(function(childSnapshot) {
			results.push(childSnapshot.val());
		});

		expect(results[0]).toBe(1);
		expect(results[1]).toBe(2);
		expect(results[2]).toBe(3);

		expect(result).toBe(false);
	});

	it('Should cancel forEach if the childAction returns true', function() {
		resource.set({
			'1': 1,
			'2': 2,
			'3': 3
		});

		var snapshot = resource._getSnapshot();
		var results = [];
		var count = 0;
		var result = snapshot.forEach(function(childSnapshot) {
			count++;
			results.push(childSnapshot.val());
			return true;
		});

		expect(results.length).toBe(1);
		expect(count).toBe(1);
		expect(result).toBe(true);
	});

	it('Should test for children', function() {
		resource.set({
			'1': 1,
			'2': 2,
			'3': 3
		});

		var snapshot = resource._getSnapshot();

		expect(snapshot.hasChild('1')).toBeTruthy();
		expect(snapshot.hasChild('4')).toBeFalsy();
	});

	it('Should test for nested children', function() {
		resource.set({
			bret: {
				'1': 1,
				'2': 2,
				'3': 3
			}
		});

		var snapshot = resource._getSnapshot();

		expect(snapshot.hasChild('bret/1')).toBeTruthy();
		expect(snapshot.hasChild('bret/4')).toBeFalsy();
		expect(snapshot.hasChild('something/random/bret/4')).toBeFalsy();
	});

	it('Should return wether or not the snapshot has children', function() {
		resource.set({
			bret: {
				'1': 1,
				'2': 2,
				'3': 3
			}
		});	

		var snapshot = resource._getSnapshot();

		expect(snapshot.hasChildren()).toBeTruthy();
		expect(snapshot.child('bret/1').hasChildren()).toBeFalsy();
	});

	it('Should return the number of children', function() {
		resource.set({
			bret: {
				'1': 1,
				'2': 2,
				'3': 3
			}
		});	

		var snapshot = resource._getSnapshot();

		expect(snapshot.numChildren()).toBe(1);
		expect(snapshot.child('bret').numChildren()).toBe(3);
	});

	it('Should return the snapshot name', function() {
		var resource1 = new SmallMouth.Resource('http://localhost:8080/test/path/your/mom');

		expect(resource._getSnapshot().name()).toBe('data');
		expect(resource1._getSnapshot().name()).toBe('mom');
	});

	it('Should return a new resource reference from a snapshot', function() {
		var snapshot = resource._getSnapshot();
		var ref = snapshot.ref();

		expect(ref._host).toBe(resource._host);
		expect(ref._path).toBe(resource._path);
		expect(ref._getSnapshot().val()).toBe(resource._getSnapshot().val());
	});

	it('Should return correctly for "falsy" values', function() {
		resource.set({
			'1': 0,
			'2': "",
			'3': false,
			'4': null,
			'5': undefined
		});	

		var val = resource._getSnapshot().val();

		expect(val[1]).toBe(0);
		expect(val[2]).toBe("");
		expect(val[3]).toBe(false);
		expect(val[4]).toBe(null);
		expect(val[5]).toBe(null);
	})
});