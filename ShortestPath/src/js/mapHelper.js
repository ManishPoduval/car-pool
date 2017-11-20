/**
 * All the calculation of routes and
 * custering of places happen here
 */
define([
        'jquery',
        'knockout'
    ],
    function ($, ko) {
        var mapHelper = {};
        var destinationId = 'destination';
        var distanceToDest = [];
        var distanceMatrixArr = [];
        var cl = [];
        var visited = [];
        var nodes = [];
        var cabSize = 4; //assuming cab size is 4
        var clusters = {};
        var endNodes = [];
        var routes = {};
        var mapViewModel, destination;

        mapHelper.getDirections = function () {
            for (var r in routes) {
                var wayPoints = [];
                mapViewModel.nodes().forEach(function (obj) {
                    if (routes[r].length) {
                        routes[r].forEach(function (routeNode) {
                            if (obj.id.split('_')[1] === routes[r]) {
                                wayPoints.push({
                                    location: obj.location,
                                    stopover: true
                                });
                            }
                        });
                    }
                });
                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;
                var origin = mapViewModel.nodes()[r].location;
                var dest = destination.location;
                directionsService.route({
                    origin: origin,
                    destination: dest,
                    waypoints: wayPoints,
                    travelMode: 'DRIVING'
                }, function (response, status) {
                    if (status === 'OK') {
                        directionsDisplay.setDirections(response);
                    } else {
                        window.alert('Directions request failed due to ' + status);
                    }
                });
            }
        };

        mapHelper.findfarthest = function () {
            if (cl.length) {
                var maxIndex;
                var maxLength = 0;
                cl.forEach(function (arr, index) {
                    if (arr && arr.length > maxLength /*&& !visited.includes(index)*/) {
                        maxIndex = index;
                        maxLength = arr.length;
                    }
                });
                return maxIndex;
            }
        };

        /**
         * now here is where the magic will happen
         * cabs are clustered here
         */
        mapHelper.clusterLocations = function () {
            var cabs = Number(mapViewModel.cabCount());
            routes = {};
            while (cabs) {
                /*cabs is manipulated directly hence you want to avoid using it here*/
                var memberInACab = Math.round(cl.length / Number(mapViewModel.cabCount()));
                var i = mapHelper.findfarthest();
                if (cl[i].length) {
                    routes[i] = [];
                    var distances = distanceMatrixArr[i];
                    var localArr = [];
                    visited.push(i);
                    memberInACab -= 1;
                    cl[i].forEach(function (d) {
                        localArr.push(distanceMatrixArr[i][d]);
                    });
                    cl[i] = null;
                    localArr.sort(function(a, b) {
                        return a - b;
                    });
                    localArr.forEach(function (val) {
                       if (memberInACab !== 0 && !visited.includes(distanceMatrixArr[i].indexOf(val))) {
                           visited.push(distanceMatrixArr[i].indexOf(val));
                           routes[i].push(distanceMatrixArr[i].indexOf(val));
                           cl[distanceMatrixArr[i].indexOf(val)] = null;
                           memberInACab -= 1;
                       }
                    });
                    cabs -= 1;
                }
            }
        };

        //TODO: need to refactor 
        /**
         *  finds clostest locations/areas based on proximity relative to the destination
         *  and decides the n end nodes for n cabs
         */
        mapHelper.closestLocations = function (cabs) {
            cl.length = 0;
            visited.length = 0;
            endNodes.length = 0;
            if (distanceMatrixArr.length && distanceToDest.length) {
                distanceMatrixArr.forEach(function (o, oIndex) {
                    var localArr = [];
                    if (o.length) {
                        o.forEach(function (d, dIndex) {
                            if (d < distanceToDest[oIndex] && distanceToDest[dIndex] < distanceToDest[oIndex] &&
                                dIndex !== oIndex && localArr.length < cabSize) {
                                localArr.push(dIndex);
                            }
                        });
                        cl.push(localArr);
                    }
                });
                mapHelper.clusterLocations();

            }
        };

        /**
         * computes the distance matrix response
         * creates a weighted graph obj from each origin to each destination
         */
        mapHelper.distanceMatrixCallback = function (response, status, desLocation) {
            mapViewModel = this;
            destination = desLocation;
            if (status === 'OK') {
                distanceMatrixArr.length = 0;
                distanceToDest.length = 0;
                clusters = {};
                nodes.length = 0;
                response.rows.forEach(function (row, o) {
                    nodes.push(o);
                    var localArr = [];
                    if (row.elements.length) {
                        row.elements.forEach(function (obj, d) {
                            var to = d === 0 ? destinationId : mapViewModel.nodes()[d - 1].id;
                            if (d === 0) {
                                distanceToDest.push(obj.distance.value);
                            }
                            else {
                                localArr.push(obj.distance.value);
                            }
                        });
                        distanceMatrixArr.push(localArr);
                    }
                });
                mapHelper.closestLocations(mapViewModel.cabCount());
            }
        };

        return mapHelper;
    })
;
