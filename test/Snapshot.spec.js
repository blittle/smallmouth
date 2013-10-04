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
});