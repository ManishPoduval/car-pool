define([
        'jquery',
        'knockout',
        'mapUtils',
        'mapViewModel'
    ],
    function($, ko, mapUtils, mapViewModel) {
        var map, viewModel;
        var googleMapAPIDeferred = $.Deferred();
        var details;

        var googleErrorHandler = function() {
            alert(mapUtils.apiError);
        };

        /*Loads the map*/
        var initMap = function(response) {
            map = new google.maps.Map(document.getElementById('map'), {
                center: {
                    lat: mapUtils.center.lat,
                    lng: mapUtils.center.lng
                },
                zoom: mapUtils.center.zoom,
                mapTypeControl: false,
                styles: mapUtils.style
            });
            googleMapAPIDeferred.resolve();
        };

        $(document).ready(function() {
            /*apply bindings when the page is ready*/
            var $mapsAPI = document.getElementById('mapsAPI');
            $mapsAPI.onload = initMap;
            $mapsAPI.onerror = googleErrorHandler;
        });

        $.when(googleMapAPIDeferred).done(function(){
            mapViewModel.create(google);
        });

    });