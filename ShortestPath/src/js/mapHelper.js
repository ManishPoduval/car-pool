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
        var routes = {};
        var mapViewModel, destination, map, markers;
        var colorsArray = ['#3ac37a', '#F1B016', '#E4DB2F'];

        mapHelper.getDirections = function () {
            markers.forEach(function (obj, index) {
                markers[index].setMap(null);
            });
            for (var r in routes) {
                var wayPoints = [];
                mapViewModel.nodes().forEach(function (obj) {
                    if (routes[r].length) {
                        routes[r].forEach(function (routeNode) {
                            if (Number(obj.id.split('_')[1]) === routeNode) {
                                wayPoints.push({
                                    location: obj.location,
                                    stopover: true
                                });
                            }
                        });
                    }
                });
                (function () {
                    var directionsService = new google.maps.DirectionsService;
                    var directionsDisplay = new google.maps.DirectionsRenderer;
                    directionsDisplay.setMap(map);
                    var origin = mapViewModel.nodes()[r].location;
                    var dest = destination.location;
                    var randomNumber = Math.round(Math.random()*r*100);
                    (function () {
                        directionsService.route({
                            origin: origin,
                            destination: dest,
                            waypoints: wayPoints,
                            travelMode: 'DRIVING'
                        }, function (response, status) {
                            if (status === 'OK') {
                                directionsDisplay.setOptions({
                                    polylineOptions: {
                                        strokeColor: colorsArray[randomNumber%3], //just a sample way
                                        strokeWeight: 7
                                    },
                                    markerOptions: {
                                        markerLabel: {
                                            color: colorsArray[randomNumber%3]
                                        }
                                    }
                                });
                                directionsDisplay.setDirections(response);
                            } else {
                                window.alert('Directions request failed due to ' + status);
                            }
                        });
                    })();
                })();
            }
        };

        /**
         * finds the farthest node from the input origins
         */
        mapHelper.findfarthest = function () {
            if (cl.length) {
                var maxIndex;
                var maxLength = 0;
                cl.forEach(function (arr, index) {
                    if (arr && arr.length > maxLength) {
                        maxIndex = index;
                        maxLength = arr.length;
                    }
                });
                if (!maxIndex && maxIndex !== 0) {
                    maxIndex = [];
                    cl.forEach(function (arr, index) {
                        if (arr && arr.length === 0) {
                            maxIndex.push(index);
                        }
                    });
                }
                return maxIndex;
            }
        };

        /**
         * now here is where the magic will happen
         * cabs are clustered here
         */
        mapHelper.clusterLocations = function () {
            var cabs = Number(mapViewModel.cabCount());
            var lonelyChild = []; //the nodes that come in common
            routes = {};
            while (cabs) {
                var localArr = [];
                /*cabs is manipulated directly hence you want to avoid using it here*/
                var memberInACab = Math.round(cl.length / Number(mapViewModel.cabCount()));
                var i = mapHelper.findfarthest();
                /*check if it's not an array of endPoints*/
                if (!i.length && !Array.isArray(i) && cl[i].length) {
                    localArr = [];
                    cl[i].forEach(function (d) {
                        if (!visited.includes(d)) {
                            localArr.push(distanceMatrixArr[i][d]);
                        }
                    });
                    if (localArr.length) {
                        routes[i] = [];
                        visited.push(i);
                        memberInACab -= 1;
                        cl[i] = null;
                        localArr.sort(function (a, b) {
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
                    else {
                        lonelyChild.push(i);
                        cl[i] = null;
                    }
                }
                else if (i.length) {
                    localArr = [];
                    i.forEach(function (val) {
                        localArr.push(distanceToDest[val]);
                    });
                    localArr.sort(function (a, b) {
                        return a - b;
                    });
                    var lastIndex = distanceToDest.indexOf(localArr[localArr.length-1]);
                    routes[lastIndex] = [];
                    cl[lastIndex] = null;
                    localArr.splice(localArr.length-1, 1);
                    localArr.forEach(function (val) {
                        if (memberInACab !== 0 && !visited.includes(distanceToDest.indexOf(val))) {
                            routes[lastIndex].push(distanceToDest.indexOf(val));
                            visited.push(distanceToDest.indexOf(val));
                            cl[distanceToDest.indexOf(val)] = null;
                            memberInACab -= 1;
                        }
                    });
                    cabs -= 1;
                }
            }
            if (lonelyChild.length) {
                /*lets push these people in one of the cabs*/
                lonelyChild.forEach(function (lc) {
                    var lcDistMax = Math.max.apply(null, distanceMatrixArr[lc]);
                    var closestStart;
                    for (var k in routes) {
                        if (routes.hasOwnProperty(k)) {
                            if (distanceMatrixArr[lc][k] < lcDistMax) {
                                closestStart = k;
                            }
                        }
                    }
                    routes[closestStart].push(lc);
                });
            }
            mapHelper.getDirections();
        };


        /**
         *  finds clostest locations/areas based on proximity relative to the destination
         */
        mapHelper.closestLocations = function (cabs) {
            cl.length = 0;
            visited.length = 0;
            if (distanceMatrixArr.length && distanceToDest.length) {
                distanceMatrixArr.forEach(function (o, oIndex) {
                    var localArr = [];
                    if (o.length) {
                        o.forEach(function (d, dIndex) {
                            if (d < distanceToDest[oIndex] && distanceToDest[dIndex] < distanceToDest[oIndex] &&
                                dIndex !== oIndex) {
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
        mapHelper.distanceMatrixCallback = function (response, status, vmObj) {
            map = vmObj.map;
            mapViewModel = this;
            destination = vmObj.desLocation;
            markers = vmObj.markers;
            if (status === 'OK') {
                distanceMatrixArr.length = 0;
                distanceToDest.length = 0;
                nodes.length = 0;
                /**
                 * loops through the response to create a 2D array
                 *  the array stores the distance from each origin to each destination
                 */
                response.rows.forEach(function (row, o) {
                    nodes.push(o);
                    var localArr = [];
                    if (row.elements.length) {
                        row.elements.forEach(function (obj, d) {
                            var to = d === 0 ? destinationId : mapViewModel.nodes()[d - 1].id;
                            if (d === 0) {
                                /**
                                 * Also seperately stores the distance from each
                                 * origin to main destination in a separate array
                                 */
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
