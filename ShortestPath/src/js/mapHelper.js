/**
 * All the calculation of routes and
 * custering of places happen here
 */
define([
        'jquery',
        'knockout'
    ],
    function ($, ko) {
        var distanceMatrixObj, mapHelper = {};
        var destinationId = 'destination';

        /**
         *  custers locations/areas based on proximity relative to the destination
         */
        mapHelper.clusterLocations = function (cabs) {

        };

        /**
         * computes the distance matrix response
         * creates a weighted graph from each origin to each destination
         */
        mapHelper.distanceMatrixCallback = function (response, status) {
            var viewModel = this;
            if (status === 'OK') {
                distanceMatrixObj = {};
                response.rows.forEach(function (row, o) {
                    if (row.elements.length) {
                        row.elements.forEach(function (obj, d) {
                            var to = d === 0 ? destinationId : viewModel.nodes()[d - 1].id;
                            if (viewModel.nodes()[o].id !== to) {
                                distanceMatrixObj[(o * response.rows.length) + d + o] = {
                                    from: viewModel.nodes()[o].id,
                                    to: to,
                                    dest: obj.distance.value, //in meters (Metric)
                                    time: obj.duration.value //in seconds
                                }
                            }
                            else {
                                /*A to A distance will always be null*/
                                distanceMatrixObj[(o * response.rows.length) + d + o] = null;
                            }
                        });
                    }
                });
                mapHelper.clusterLocations(viewModel.cabCount());
            }
        };

        return mapHelper;
    });
