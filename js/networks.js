function Network(nwid, name, private, authorizedMemberCount) {
	this.nwid = nwid;
	this.name = name;
	this.private = private;
	this.authorizedMemberCount = authorizedMemberCount;
}

function NetworksViewModel() {
	var self = this;
	self.networks = ko.observableArray();
	self.new_name = ko.observable('');

	self.addNetwork = function(network) {
		self.networks.push(network);
	}

	self.createNetwork = function() {
		zt.create_network(self.new_name(), function(err, res) {
			if(err) {
				alert('Could not create network: ' + res);
				return;
			}

			self.addNetwork(new Network(res.nwid, res.name, res.private, res.authorizedMemberCount));
		});

		self.new_name('');
	}
}

function update_network_list() {
	zt.list_networks(function(err, networks) {
		if(err) {
			alert("Could not retrieve networks: " + networks);
			return;
		}
					
		for(var i = 0; i < networks.length; i++) {
			zt.get_network(networks[i], function(err, network) {
				if(err) {
					alert("Could not get network info: " + network);
					return;
				}

				networksViewModel.addNetwork(network);
 			});
		}
 	});
 }

zt = new ZeroTier('api', window.localStorage.auth_secret, function(err, status) {
	if(err) {
		alert("Could not connect to API: " + status);
		return;
	}

	update_network_list();
});

networksViewModel = new NetworksViewModel();
ko.applyBindings(networksViewModel);