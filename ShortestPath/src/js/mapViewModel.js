define([
	'jquery',
	'knockout',
	],
	function($, ko){
		var mvm, viewModel;
		var google;
		var $wrapper = $('#wrapper');

		function mapViewModel() {
           	var self = this;

            self.toggleMenu = function() {
                $("#wrapper").toggleClass("toggled");
            };

            self.projectTitle = 'Car Pool'; //no need to make this an observable

            self.calBtnText = 'Calculate';

            self.enableCalBtn = ko.observable(false); 

            self.gitRepo = 'https://github.com/ManishPoduval/dijkstra-car-pool';

            /* view them as your pick and drop locations
            * for atleast one input field to appear initialize the array
            * to an empty object 
            */
            self.nodes = ko.observableArray([{}]); 
		}

		mvm = {
			create: function(googleObj) {
				google = googleObj;
				viewModel = new mapViewModel();
				ko.applyBindings(viewModel, $wrapper.get(0));
			}

		}

		return mvm;
	});