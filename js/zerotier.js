var ZeroTier = function(base_url, auth_secret, callback) {
	var self = this;
	self.base_url = base_url;
	self.auth_secret = auth_secret;
	self.address = null;

	self._call = function(method, resource, data, callback) {
		resource = base_url + resource + '?auth=' + auth_secret;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState == xhr.DONE) {
				if(xhr.status != 200) {
					callback(true, xhr.status);
				} else {
					try {
						var response = xhr.response;
						if(response == '') {
							// avoid exception for empty JSON response (returned for delete operations)
							response = '{}';
						}

						var res = JSON.parse(response);
						callback(false, res);
					} catch(e) {
						callback(true, e.toString());
					}
				}
			}
		}
		xhr.open(method, resource);

		if(method === 'POST') {
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(JSON.stringify(data));
		} else {
			xhr.send();
		}
	}

	self._get = function(resource, callback) {
		self._call('GET', resource, null, callback);
	}
	
	self._delete = function(resource, callback) {
		self._call('DELETE', resource, null, callback);
	}

	self._post = function(resource, data, callback) {
		self._call('POST', resource, data, callback);
	}

	self._get('/status', function(err, res) {
		if(err) {
			callback(err, res);
		} else {
			self.address = res.address;
			callback(err, res);
		}
	});
};

ZeroTier.prototype.list_networks = function(callback) {
	this._get('/controller/network', callback);
};

ZeroTier.prototype.create_network = function(name, callback) {
	this._post('/controller/network/' + this.address + '______', { 'name': name }, callback);
};

ZeroTier.prototype.get_network = function(nwid, callback) {
	this._get('/controller/network/' + nwid, callback);
};

ZeroTier.prototype.update_network = function(network, callback) {
	this._post('/controller/network/' + network.nwid, network, callback);
};

ZeroTier.prototype.delete_network = function(nwid, callback) {
	this._delete('/controller/network/' + nwid, callback);
};

ZeroTier.prototype.network_list_members = function(nwid, callback) {
	this._get('/controller/network/' + nwid + '/member', callback);
};

ZeroTier.prototype.network_get_member = function(nwid, address, callback) {
	this._get('/controller/network/' + nwid + '/member/' + address, callback);
}

ZeroTier.prototype.network_update_member = function(member, callback) {
	this._post('/controller/network/' + member.nwid + '/member/' + member.address, member, callback);
}

ZeroTier.prototype.network_delete_member = function(member, callback) {
	this._delete('/controller/network/' + member.nwid + '/member/' + member.address, callback);
}