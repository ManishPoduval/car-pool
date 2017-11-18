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
        var clusters = [];
        /**
         *  custers locations/areas based on proximity relative to the destination
         *  @param {cabs} the count of clusters to create
         */
        mapHelper.clusterLocations = function (cabs) {
            clusters.length = 0;
            if (distanceMatrixArr.length && distanceToDest.length) {
                distanceMatrixArr.forEach(function (o, oIndex) {
                    var localArr = [];
                    if (o.length) {
                        o.forEach(function (d, dIndex) {
                            if (d < distanceToDest[oIndex] && distanceToDest[dIndex] > d && dIndex !== oIndex) {
                                localArr.push(dIndex);
                            }
                        });
                        clusters.push(localArr);
                    }
                });
            }
        };

        /**
         * computes the distance matrix response
         * creates a weighted graph obj from each origin to each destination
         */
        mapHelper.distanceMatrixCallback = function (response, status) {
            var viewModel = this;
            if (status === 'OK') {
                distanceMatrixArr.length = 0;
                distanceToDest.length = 0;
                response.rows.forEach(function (row, o) {
                    var localArr = [];
                    if (row.elements.length) {
                        row.elements.forEach(function (obj, d) {
                            var to = d === 0 ? destinationId : viewModel.nodes()[d - 1].id;
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
                mapHelper.clusterLocations(viewModel.cabCount());
            }
        };

        return mapHelper;
    });
