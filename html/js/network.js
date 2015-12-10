/* 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * Copyright (c) 2015 Keno Schwalb
 */

assignModes = {
	'zt': { id: 'zt', name: 'ZeroTier managed' },
	'none': { id: 'none', name: 'Unmanaged' },
	'dhcp': { id: 'dhcp', name: 'DHCP' }
};

function get_network_details() {
	var hash = window.location.hash
	var nwid = hash.substr(1, hash.length);
	zt.get_network(nwid, function(err, network) {
		if(err) {
			alert("Could not retrieve network details: " + network);
			return;
		}
		
		networkViewModel = {
			view: {
				availablev4AssignModes: ko.observableArray([
					assignModes['none'],
					assignModes['zt'],
					assignModes['dhcp']
				]),
				availablev6AssignModes: ko.observableArray([
					assignModes['none'],
					assignModes['zt']
				])
			},
			network: network,
			members: ko.observableArray()
		};
	
		networkViewModel.config = {};
		for(var key in network) {
			networkViewModel.config[key] = ko.observable(network[key]);
		}
	
		networkViewModel.view.chosenv4AssignMode = ko.observable(assignModes[network.v4AssignMode]);
		networkViewModel.view.chosenv6AssignMode = ko.observable(assignModes[network.v6AssignMode]);
		
		var ipRangeStart = '';
		var ipRangeEnd = '';
		var localRoute = '';
		
		if(network.ipAssignmentPools.length > 0) {
			ipRangeStart = network.ipAssignmentPools[0].ipRangeStart;
			ipRangeEnd = network.ipAssignmentPools[0].ipRangeEnd;
		}
		
		if(network.ipLocalRoutes.length > 0) {
			localRoute = network.ipLocalRoutes[0];
		}
		
		networkViewModel.view.ipRangeStart = ko.observable(ipRangeStart);
		networkViewModel.view.ipRangeEnd = ko.observable(ipRangeEnd);
		networkViewModel.view.localRoute = ko.observable(localRoute);
		
		networkViewModel.view.rules = {
			all: ko.observable(false),
			ipv4: ko.observable(false),
			ipv6: ko.observable(false),
			ipx: ko.observable(false),
			aoe: ko.observable(false)
		};
		for(var i = 0; i < network.rules.length; i++) {
			var accept = (network.rules[i].action == 'accept');
			if(typeof network.rules[i].etherType == 'undefined') {
				networkViewModel.view.rules.all(accept);
			} else {
				switch(network.rules[i].etherType) {
					case 0x0806: // arp
					case 0x0800: // ipv4
						networkViewModel.view.rules.ipv4(accept);
						break;
					case 0x08137: // ipx
					case 0x08138: // ipx
						networkViewModel.view.rules.ipx(accept);
						break;
					case 0x86DD: // ipv6
						networkViewModel.view.rules.ipv6(accept);
						break;
					case 0x88A2: // AoE
						networkViewModel.view.rules.aoe(accept);
						break;
				}
			}
		}
		
		zt.network_list_members(network.nwid, function(err, members) {
			if(err) {
				alert('Could not list members: ' + members);
				return;
			}

			for(var memberId in members) {
				zt.network_get_member(network.nwid, memberId, function(err, member) {
					if(err) {
						alert('Could not retrieve member details: ' + member);
						return;
					}

					memberModel = {
						config: member,
						view: {}
					};
					
					if(member.recentLog.length > 0) {
						memberModel.view.lastIp = member.recentLog[0].fromAddr;
					} else {
						memberModel.view.lastIp = '';
					}
						
					if(member.ipAssignments.length > 0) {
						memberModel.view.assignedIp = member.ipAssignments[0];
					} else {
						memberModel.view.assignedIp = '';
					}
					networkViewModel.members.push(memberModel);
				});
			}
		});

		/**
		 * Delete a given member
		 **/
		networkViewModel.deleteMember = function(member) {
			var confirmation = confirm('Delete member?');
			if(confirmation) {
				zt.network_delete_member(member.config, function(err, res) {
					if(err) {
						alert('Could not delete member:' + res);
						return;
					}

					networkViewModel.members.remove(member);
				});
			}
		};
		
		/**
		 * Delete a given network
		 **/
		networkViewModel.deleteNetwork = function() {
			var confirmation = confirm('Delete network?');
			if(confirmation) {
				zt.delete_network(network.nwid, function(err, res) {
					if(err) {
						alert('Could not delete network:' + res);
						return;
					}

					window.location = 'index.html';
				});
			}
		};

		/**
		 * Save all settings specific to a single user
		 **/
		networkViewModel.saveMemberSettings = function(member) {
			if(member.config.ipAssignments.length == 0 && member.view.assignedIp != '') {
				member.config.ipAssignments.push(member.view.assignedIp);
			} else if(member.config.ipAssignments > 0 && member.view.assignedIp == '') {
				delete member.config.ipAssignments[0];
			} else {
				member.config.ipAssignments[0] = member.view.assignedIp;
			}

			// update member via API
			zt.network_update_member(member.config, function(err, res) {
				if(err) {
					alert('Could not save member settings: ' + res);
				}
			});
		};
		
		/**
		 * Save all settings regarding the network, except for user specific settings
		 **/
		networkViewModel.saveNetworkSettings = function() {
			// udpdate the network object retrieved form the API
			network.name = networkViewModel.config.name();
			network.private = networkViewModel.config.private();
			network.v4AssignMode = networkViewModel.view.chosenv4AssignMode().id;
			network.v6AssignMode = networkViewModel.view.chosenv6AssignMode().id;
			network.multicastLimit = networkViewModel.config.multicastLimit();
			network.enableBroadcast = networkViewModel.config.enableBroadcast();
			
			var rules = [
				{ // all
					action: networkViewModel.view.rules.all() ? 'accept' : 'drop',
					ruleNo: 1
				},
				{ // ipv4
					action: networkViewModel.view.rules.ipv4() ? 'accept' : 'drop',
					ruleNo: 20,
					etherType: 0x0800
				},
				{ // arp if ipv4
					action: networkViewModel.view.rules.ipv4() ? 'accept' : 'drop',
					ruleNo: 21,
					etherType: 0x0806
				},
				{ // ipv6
					action: networkViewModel.view.rules.ipv6() ? 'accept' : 'drop',
					ruleNo: 30,
					etherType: 0x86DD
				},
				{ // ipx
					action: networkViewModel.view.rules.ipx() ? 'accept' : 'drop',
					ruleNo: 40,
					etherType: 0x08137
				},
				{ // ipx
					action: networkViewModel.view.rules.ipx() ? 'accept' : 'drop',
					ruleNo: 41,
					etherType: 0x08138
				},
				{ // AoE
					action: networkViewModel.view.rules.aoe() ? 'accept' : 'drop',
					ruleNo: 50,
					etherType: 0x88A2
				}
			];
			
			network.rules = rules;
			
			if(network.v4AssignMode == 'zt') {
				network.ipAssignmentPools[0] = {
					ipRangeStart: networkViewModel.view.ipRangeStart(),
					ipRangeEnd: networkViewModel.view.ipRangeEnd()
				};
				network.ipLocalRoutes[0] = networkViewModel.view.localRoute();
			}
			
			zt.update_network(network, function(err, res) {
				if(err) {
					alert("Could not save network details");
				}
			});
		};
		
		// apply the view to the document
		ko.applyBindings(networkViewModel);
	});
}

// connect to the ZeroTier API
zt = new ZeroTier('api', window.localStorage.auth_secret, function(err, status) {
	if(err) {
		alert("Could not connect to API: " + status);
		return;
	}

	get_network_details();
});