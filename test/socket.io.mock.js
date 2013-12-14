var io = {
	connect: function() {
		return {
			on: function(type, callback) {
				if(type == 'ready') {
					callback({
						id: Math.random(),
						token: Math.random()
					});
				}
			},
			emit: function() {
				
			}
		}
	}
};