/* 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * Copyright (c) 2016 Keno Schwalb
 */

function LoginViewModel() {
	var self = this;
	self.password = ko.observable('');

	self.login = function() {
		zt = new ZeroTier('api', self.password(), function(err, status) {
			if(err) {
				alert("Could not connect to API: " + status + "\nPlease make sure you entered the correct password.");
				return;
			}

			window.localStorage.auth_secret = self.password();
			window.location.href = "networks.html";
		});
	}

	// logout
	if(window.location.hash == "#logout") {
		window.localStorage.clear();
	}

	// check if we are currently logged in
	if(typeof window.localStorage.auth_secret != undefined && window.localStorage.auth_secret != '') {
		zt = new ZeroTier('api', window.localStorage.auth_secret, function(err, status) {
			if(!err) {
				// redirect to networks
				window.location.href = "networks.html";
			}
		});
	}
}

loginViewModel = new LoginViewModel();
ko.applyBindings(loginViewModel);