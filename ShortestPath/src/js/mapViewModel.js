define([
	'jquery',
	'knockout',
	],
	function($, ko){
		var mvm, viewModel;
		var google;
		var first = false;
		var $wrapper = $('#wrapper');

		/*restrictng the autocomplete to only india for now*/
        var options = {
            componentRestrictions: {
                country: 'in'
            }
        };

		var setUpAutocomplete = function (element) {
            var autocomplete = new google.maps.places.Autocomplete(document.getElementById(element), options);

            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                var place = autocomplete.getPlace();
                console.log(place);
            });
        };

		function mapViewModel() {
           	var self = this;

            self.toggleMenu = function() {
            	if (!first) {
					/*the first block*/
                    setUpAutocomplete(viewModel.locationIdPrefix + 0);
                    first = true;
				}
                $("#wrapper").toggleClass("toggled");
            };

            self.locationIdPrefix = 'location_';
			self.projectTitle = 'Car Pool'; //no need to make this an observable
			self.calBtnText = 'Calculate';
			self.enableCalBtn = ko.observable(false);
			self.gitRepo = 'https://github.com/ManishPoduval/dijkstra-car-pool';

            /**
			 * view them as your pick and drop locations
			 * for atleast one input field to appear initialize the array
			 * to an empty object
			 */
            self.nodes = ko.observableArray([{}]);

            /*add a node to left nav*/
            self.addNode = function (index) {
				self.nodes.push({id: self.locationIdPrefix + index});
                setUpAutocomplete(self.locationIdPrefix + index);
            };

            /*delete a node from left nav*/
            self.deleteNode = function () {
				self.nodes.remove(this);
            };
		}

		mvm = {
			create: function(googleObj) {
				google = googleObj;
				viewModel = new mapViewModel();
				/*reduntant calls*/
				setUpAutocomplete('destination');
				ko.applyBindings(viewModel, $wrapper.get(0));
			}

		};

		return mvm;
	});