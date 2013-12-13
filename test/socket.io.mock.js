var io = {
	connect: function() {
		return {
			on: function(type, callback) {
				if(type == 'connect') {
					callback();
				}
			},
			emit: function() {
				
			}
		}
	}
};