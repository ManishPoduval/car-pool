var map, viewModel;
var markers = [];
var googleMapAPIDeferred = $.Deferred();
var infoWindow;
var details;

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        return this.substr(position || 0, searchString.length) === searchString;
    };
}

/*Array of locations that are shown as top 5 places*/
var locations = [
    {
        title: 'Goa Science Center',
        location: {
            lat: 15.478662,
            lng: 73.808727
        }
    },
    {
        title: 'Santana Church',
        location: {
            lat: 15.478166,
            lng: 73.891640
        }
    },
    {
        title: 'Fort Aguda',
        location: {
            lat: 15.492393,
            lng: 73.773537
        }
    },
    {
        title: 'Dias Beach',
        location: {
            lat: 15.453432,
            lng: 73.802273
        }
    },
    {
        title: 'Santa Cruz Church',
        location: {
            lat: 15.476346,
            lng: 73.844776
        }
    }
];

/*list of places in goa with lat lng*/
var listOfPlacesDataSet = [
    {
        title: 'Teleigao market',
        location: {
            lat: 15.470018,
            lng: 73.821902
        }
    },
    {
        title: 'Goa University',
        location: {
            lat: 15.458478,
            lng: 73.834476
        }
    },
    {
        title: 'Dona Paula',
        location: {
            lat: 15.461374,
            lng: 73.813602
        }
    },
    {
        title: 'Reis Magos Fort',
        location: {
            lat: 15.497108,
            lng: 73.809500
        }
    },
    {
        title: 'Goa Museum',
        location: {
            lat: 15.493179,
            lng: 73.833060
        }
    },
    {
        title: 'Joggers Park',
        location: {
            lat: 15.486086,
            lng: 73.826125
        }
    },
    {
        title: 'Boca de Vaca',
        location: {
            lat: 15.494750,
            lng: 73.825722
        }
    }
];

var getDeatislFromFoursquare = function (location, deferred) {
    var clientID = '3PR50Y1HIT2PB1DYIBYUBFS0T2ZOSHIBBGSPKJ221AYEVMNW';
    var clientSecret = 'Q3TYO04YZZAZZYEN30WR4ZTKGKD4KDQ0VBSBUJ5AOIKDYSLW';
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search?ll=' +
        location.location.lat + ',' + location.location.lng + '&client_id=' + clientID +
        '&client_secret=' + clientSecret + '&query=' + location.title +
        '&v=20170708' + '&m=foursquare',
        success: function (response) {
            deferred.resolve();
            details = response.response.venues[0];
        },
        error: function (response) {
            alert('Foursquare is not responding. Please try again.');
        }
    });
};

/*this function will populate the infowindow when a
 marker is clicked explicitly or from the list*/
var populateInfoWindow = function (marker, infoWindow, location) {
    var foursquareDeferred = $.Deferred();
    details = {};
    getDeatislFromFoursquare(location, foursquareDeferred);
    $.when(foursquareDeferred).then(function () {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infoWindow.marker != marker) {
            // Make sure the marker property is cleared if the infowindow is closed.
            infoWindow.addListener('closeclick', function () {
                infoWindow.marker = null;
                marker.setIcon(makeMarkerIcon('d9f111'));
            });
            infoWindow.setContent('<span>CheckinsCount: ' + details.stats.checkinsCount + '</span><br>' +
                '<span> Users: ' + details.stats.usersCount + '</span><br>' +
                '<span> Tips: ' + details.stats.tipCount + '</span>');
            infoWindow.open(map, marker);
        }
    });
};

/*This function takes in a COLOR,
 and then creates a new marker icon of that color.
 The icon will be 21 px wide by 34 high, have an origin of 0, 0
 and be anchored at 10, 34).*/
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

/*Creates default markers on the map*/
var createMarkers = function (array) {
    markers = [];
    infoWindow = new google.maps.InfoWindow();
    var defaultIcon = makeMarkerIcon('d9f111');
    var highlightedIcon = makeMarkerIcon('dc0b28');
    array.forEach(function (location, index) {
        var position = location.location;
        var title = location.title;
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: index
        });

        /*store all the markers in an array*/
        markers.push(marker);

        /*create click event listeners for each*/
        marker.addListener('click', function () {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
            setTimeout(function () {
                marker.setAnimation(null);
            }, 900);
            populateInfoWindow(this, infoWindow, location);
        });

        marker.addListener('mouseover', function () {
            this.setIcon(highlightedIcon);
        });

        marker.addListener('mouseout', function () {
            this.setIcon(defaultIcon);
        });
    });
};


/*creates the list of places that is shown in the left nav menu*/
var generateList = function () {
    viewModel.listOfPlaces([]);
    locations.forEach(function (obj) {
        viewModel.listOfPlaces.push(obj);
    });

    listOfPlacesDataSet.forEach(function (obj) {
        viewModel.listOfPlaces.push(obj);
    });

    /*sort listOfPlaces array*/
    viewModel.listOfPlaces.sort(function (a, b) {
        var nameA = a.title.toUpperCase(); // ignore upper and lowercase
        var nameB = b.title.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        // names must be equal
        return 0;
    });
};

var googleErrorHandler = function () {
    alert('Google API failed to lead. Please refresh your screen');
};

/*styles for the google map*/
var getStyes = function () {
    return [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#4a4a4a"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#5f5f5f"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#94baa3"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#9a9a9a"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#858585"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#459dd8"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
]
};

/*Loads the map*/
var initMap = function (response) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 18.569212,
            lng: 73.773665
        },
        zoom: 15,
        mapTypeControl: false,
        styles: getStyes()
    });
    googleMapAPIDeferred.resolve();
};

var createMapBounds = function () {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
};

/*our viewModel the project*/
function mapViewModel() {
    var self = this;
    /*This will show by markers of the top 5 places in the neighbourhood*/
    self.showListings = function () {
        self.hideListings();
        createMarkers(locations);
        createMapBounds();
        /*hide the navbar so the user can view the complete map*/
        self.toggleMenu();
    };

    /*This will hide the markers of the top 5 places in the neighbourhood*/
    self.hideListings = function () {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        /*hide the navbar so the user can view the complete map*/
        self.toggleMenu();
    };

    /*function will toggle the sidebar on and off*/
    self.toggleMenu = function () {
        $("#wrapper").toggleClass("toggled");
    };

    /*Banner title*/
    self.projectTitle = ko.observable('Car Pool');
    self.listOfPlaces = ko.observableArray([]);

    /*function shows all the default listings*/
    self.showAllLocations = function () {
        self.hideListings();
        viewModel.listOfPlaces([]);
        generateList();
        createMarkers(viewModel.listOfPlaces());
        createMapBounds();
        self.toggleMenu();
    };

    self.searchQuery = ko.observable();

    /*function that filters based on search query*/
    self.filterLocations = function () {
        var text = self.searchQuery();
        var filteredList = [];
        generateList();
        if (isNaN(text) && text.trim() !== "") {
            viewModel.listOfPlaces().forEach(function (location) {
                if (location.title.toLowerCase().startsWith(text)) {
                    filteredList.push(location);
                }
            });
            if (filteredList.length === 0) {
                alert('No places found. Please query your filter search again.');
            } else {
                viewModel.listOfPlaces(filteredList);
            }
        }
        self.hideListings();
        createMarkers(viewModel.listOfPlaces());
        createMapBounds();
    };

    /*will open info window of the location*/
    self.showInfo = function (obj) {
        markers.forEach(function (marker) {
            marker.setIcon(makeMarkerIcon('d9f111'));
            if (marker.title === obj.title) {
                marker.setIcon(makeMarkerIcon('dc0b28'));
                populateInfoWindow(marker, infoWindow, obj);
            }
        });
    };

}

$(document).ready(function () {
    /*apply bindings when the page is ready*/
    viewModel = new mapViewModel();
    $.when(googleMapAPIDeferred).done(function () {
        generateList();
        viewModel.showNeighbourhoodMap();
    });
    ko.applyBindings(viewModel);
});