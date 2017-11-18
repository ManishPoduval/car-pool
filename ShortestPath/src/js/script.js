define([
        'jquery',
        'knockout',
        'mapUtils',
        'mapViewModel'
    ],
    function ($, ko, mapUtils, mapViewModel) {
        var map;
        var googleMapAPIDeferred = $.Deferred();

        var googleErrorHandler = function () {
            alert(mapUtils.apiError);
        };

        /*Loads the map*/
        var initMap = function (response) {
            map = new google.maps.Map(document.getElementById('map'), {
                center: {
                    lat: mapUtils.center.lat,
                    lng: mapUtils.center.lng
                },
                zoom: mapUtils.center.zoom,
                mapTypeControl: false,
                styles: mapUtils.style
            });
            /*var streetView = map.getStreetView();
            google.maps.event.addListener(streetView, 'visible_changed', function () {
                // Display your street view visible UI
                if (streetView.getVisible()) {

                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('map'), {
                            addressControlOptions: {
                                position: google.maps.ControlPosition.RIGHT, // <- change position
                            }
                        });
                    // rewrite default options
                    map.setStreetView(panorama);

                } else {
                    console.log('show default UI');
                }
            });*/
            googleMapAPIDeferred.resolve();
        };

        $(document).ready(function () {
            var $mapsAPI = document.getElementById('mapsAPI');
            $mapsAPI.onload = initMap;
            $mapsAPI.onerror = googleErrorHandler;
        });

        /*worse case scenario failure handler*/
        setTimeout(function () {
            if (googleMapAPIDeferred.state() === 'pending' && !$('#map').get(0).childNodes.length) {
                alert('Ooops, Google API crashed. Please reload the page!');
            }
        }, 5000);

        $.when(googleMapAPIDeferred).done(function () {
            /*Call and create the view model*/
            mapViewModel.create(map);
        });

    });