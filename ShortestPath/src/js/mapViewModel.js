define([
	'jquery',
	'knockout',
	],
	function($, ko){
		var mvm, viewModel;
		var $wrapper = $('#wrapper')

		function mapViewModel() {
           	var self = this;
            self.toggleMenu = function() {
                $("#wrapper").toggleClass("toggled");
            };
            self.projectTitle = 'Car Pool';
		}

		mvm = {
			create: function(mapObj) {
				viewModel = new mapViewModel();
				ko.applyBindings(viewModel, $wrapper.get(0));
			}

		}

		return mvm;
	});