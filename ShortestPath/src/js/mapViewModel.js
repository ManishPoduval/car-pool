define([
        'jquery',
        'knockout',
        'mapUtils',
        'mapHelper'
    ],
    function ($, ko, mapUtils, mapHelper) {
        var mvm, viewModel, map, currentField;
        var first = false;
        var $wrapper = $('#wrapper');
        var markers = [];
        var desLocation = {}; //store destination properties here
        var constDestination = 'destination'; //id of destination search input field
        var origins, destination = [];

        /*restrictng the autocomplete to only india for now*/
        var options = {
            componentRestrictions: {
                country: 'in'
            }
        };

        /**
         *
         * @param {id} The id of location to update
         * @param {location} Object containing lat and lng values
         */
        var updateNodeLatLng = function (id, location) {
            if (id !== constDestination) {
                viewModel.nodes().forEach(function (obj) {
                    if (id === obj.id) {
                        obj.location.lat = location.lat();
                        obj.location.lng = location.lng();
                    }
                })
            }
            else {
                desLocation.id = id;
                desLocation.location = {};
                desLocation.location.lat = location.lat();
                desLocation.location.lng = location.lng();
            }
        };

        /*ensures all your markers are visible at once to the end user*/
        var updateMapBounds = function () {
            var bounds = new google.maps.LatLngBounds();
            // Extend the boundaries of the map for each marker and display the marker
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(map);
                bounds.extend(markers[i].position);
            }
            map.fitBounds(bounds);
        };

        /**
         *
         * @param {currentId} The id for which we create a marker
         */
        var createMarker = function (currentId) {
            var nodeLocation = currentId === constDestination ? desLocation
                : viewModel.nodes().filter(function (node) {
                    return node.id === currentId;
                });
            var marker = new google.maps.Marker({
                map: map,
                position: currentId === constDestination ? desLocation.location : nodeLocation[0].location,
                animation: google.maps.Animation.DROP,
                icon: currentId === constDestination ? mapUtils.makeMarkerIcon(mapUtils.destinationMarkerColor) : mapUtils.makeMarkerIcon(mapUtils.defaultMarkerColor),
                id: currentId === constDestination ? desLocation.id : nodeLocation[0].id
            });
            /*ensure that you clear the markers if you edit your locations*/
            deleteMarker(marker.id);
            markers.push(marker);
            marker.addListener('mouseover', function () {
                this.setIcon(currentId === constDestination ? mapUtils.makeMarkerIcon(mapUtils.destinationHighlighted) : mapUtils.makeMarkerIcon(mapUtils.highlightedMarkerColor));
            });

            marker.addListener('mouseout', function () {
                this.setIcon(currentId === constDestination ? mapUtils.makeMarkerIcon(mapUtils.destinationMarkerColor) : mapUtils.makeMarkerIcon(mapUtils.defaultMarkerColor));
            });
        };

        /**
         *
         * @param {id} The id for which we delete the marker
         */
        var deleteMarker = function (id) {
            var markerIndex;
            markers.some(function (obj, index) {
                /*note the obj here is a single marker*/
                if (obj.id === id) {
                    markerIndex = index;
                    return true;
                }
            });
            if (markerIndex >= 0) {
                markers[markerIndex].setMap(null);
                markers.splice(markerIndex, 1);
            }
        };

        /**
         *
         * @param {element} The id of the DOM element (input tag)
         * Sets up the google autocomplete for the DOM element
         */
        var setUpAutocomplete = function (element) {
            var autocomplete = new google.maps.places.Autocomplete(document.getElementById(element), options);
            autocomplete.bindTo('bounds', map);
            google.maps.event.addListener(autocomplete, 'place_changed', function (element) {
                var place = autocomplete.getPlace();
                var currentLoc = currentField;
                updateNodeLatLng(currentLoc, autocomplete.getPlace().geometry.location);
                /*create a new marker for each location*/
                createMarker(currentLoc);
                if (!place.place_id) {
                    return;
                }
                console.log(place);
                updateMapBounds();
            });
        };

        /**
         *
         * @param {destinationObj} array of objects of destinations.
         *        the object contains lat and lng values
         * @param {originsArr} array of objects containing origins.
         *        the object contains lat lng values
         */
        var googleDistanceMatrix = function (destinationObj, originsArr) {
            var service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix(
                {
                    origins: originsArr,
                    destinations: destinationObj,
                    travelMode: 'DRIVING'
                }, function (response, status) {
                    mapHelper.distanceMatrixCallback.call(viewModel, response, status, desLocation);
                });
        };

        function MapViewModel() {
            var self = this;

            self.toggleMenu = function () {
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
            self.enableCalBtn = ko.observable(true);
            self.gitRepo = 'https://github.com/ManishPoduval/dijkstra-car-pool';
            self.cabCount = ko.observable();

            /**
             * view them as your pick and drop locations
             * for atleast one input field to appear initialize the array
             * to an empty object
             */
            self.nodes = ko.observableArray([{
                id: self.locationIdPrefix + 0,
                location: {
                    lat: null,
                    lng: null
                }
            }]);

            /*add a node to left nav*/
            self.addNode = function () {
                self.nodes.push({
                    id: self.locationIdPrefix + self.nodes().length,
                    location: {
                        lat: null,
                        lng: null
                    }
                });
                setUpAutocomplete(self.locationIdPrefix + (self.nodes().length - 1));
            };

            /*delete a node from left nav*/
            self.deleteNode = function () {
                self.nodes.remove(this);
                deleteMarker(this.id);
                updateMapBounds();
            };

            /*sets the current field id to map with the location being selected*/
            self.setCurrentField = function (data, event) {
                currentField = event.target.id;
            };

            /*calculates the shortest path between the nodes and the destination*/
            self.calculateShortestPath = function () {
                destination = [];
                //ensure that the destination is always first
                destination.push(desLocation.location);
                origins = [];
                if (destination) {
                    self.nodes().forEach(function (obj) {
                        origins.push(obj.location);
                        destination.push(obj.location);
                    });
                    googleDistanceMatrix(destination, origins);
                }
                else {
                    console.warn('You\'ve missed entering location somewhere');
                }
            };
        }

        mvm = {
            create: function (mapObj) {
                map = mapObj;
                viewModel = new MapViewModel();
                setUpAutocomplete(constDestination);
                ko.applyBindings(viewModel, $wrapper.get(0));
            }
        };

        return mvm;
    });