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
            var $mapsAPI = document.getElementById('mapsAPI');
            $mapsAPI.onload = initMap;
            $mapsAPI.onerror = googleErrorHandler;
        });

        /*worse case scenario failure handler*/
        setTimeout(function() {
            if (googleMapAPIDeferred.state() === 'pending' && !$('#map').get(0).childNodes.length) {
                alert('Ooops, Google API crashed. Please reload the page!');
            }
        }, 2000);

        $.when(googleMapAPIDeferred).done(function() {
            /*Call and create the view model*/
            mapViewModel.create(google);
        });

    });