
            var map;

            // Create a new blank array for all the listing markers.
            var markers = [];

            function initMap() {

                                // Create a styles array to use with the map.
                var styles = [
                    {
                        featureType: 'water',
                        stylers: [
                            { color: '#19a0d8' }
                        ]
                    },{
                        featureType: 'administrative',
                        elementType: 'labels.text.stroke',
                        stylers: [
                            { color: '#ffffff' },
                            { weight: 6 }
                        ]
                    },{
                        featureType: 'administrative',
                        elementType: 'labels.text.fill',
                        stylers: [
                            { color: '#e85113' }
                        ]
                    },{
                        featureType: 'road.highway',
                        elementType: 'geometry.stroke',
                        stylers: [
                            { color: '#efe9e4' },
                            { lightness: 100 }
                        ]
                    },{
                        featureType: 'transit.station',
                        stylers: [
                            { weight: 9 },
                            { hue: '#e85113' }
                        ]
                    },{
                        featureType: 'road.highway',
                        elementType: 'labels.icon',
                        stylers: [
                            { visibility: 'off' }
                        ]
                    },{
                        featureType: 'water',
                        elementType: 'labels.text.stroke',
                        stylers: [
                            { lightness: 100 }
                        ]
                    },{
                        featureType: 'water',
                        elementType: 'labels.text.fill',
                        stylers: [
                            { lightness: -100 }
                        ]
                    },{
                        featureType: 'poi',
                        elementType: 'geometry',
                        stylers: [
                            { visibility: 'on' },
                            { color: '#f0e4d3' }
                        ]
                    },{
                        featureType: 'road.highway',
                        elementType: 'geometry.fill',
                        stylers: [
                            { color: '#efe9e4' },
                            { lightness: -25 }
                        ]
                    }
                ];
                // Constructor creates a new map - only center and zoom are required.
                map = new google.maps.Map(document.getElementById('map'), {
                    center: {lat: 11.017944, lng: 76.961055},
                    zoom: 13,
                    styles: styles,
                    mapTypeControl: false
                });

                // These are the real estate listings that will be shown to the user.
                // Normally we'd have these in a database instead.
                var locations = [
                    {title: 'VOC', site: 'www.voc.com', location: {lat: 11.006829, lng: 76.971147}},
                    {title: 'Indira Gandhi', site: 'ind.com', location: {lat: 10.420428, lng: 77.115441}},
                    {title: 'Niligris', site: 'nil.com', location: {lat: 11.098200, lng: 76.749450}}
                    ];


                var largeInfowindow = new google.maps.InfoWindow();

                var defaultIcon = makeMarkerIcon('0091ff');

                // Create a "highlighted location" marker color for when the user
                // mouses over the marker.
                var highlightedIcon = makeMarkerIcon('FFFF24');

                // The following group uses the location array to create an array of markers on initialize.
                for (var i = 0; i < locations.length; i++) {
                    // Get the position from the location array.
                    var position = locations[i].location;
                    var title = locations[i].title;
                    var site = locations[i].site;
                    // Create a marker per location, and put into markers array.
                    var marker = new google.maps.Marker({
                        position: position,
                        title: title,
                        site: site,
                        animation: google.maps.Animation.DROP,
                        icon: defaultIcon,
                        id: i
                    });
                    // Push the marker to our array of markers.
                    markers.push(marker);
                    // Create an onclick event to open an infowindow at each marker.
                    marker.addListener('click', function() {
                        populateInfoWindow(this, largeInfowindow);
                    });

                    marker.addListener('mouseover', function() {
                        this.setIcon(highlightedIcon);
                    });
                    marker.addListener('mouseout', function() {
                        this.setIcon(defaultIcon);
                    });
                }
                document.getElementById('show-listings').addEventListener('click', showListings);
                document.getElementById('hide-listings').addEventListener('click', hideListings);
                // Extend the boundaries of the map for each marker
            }
            // This function populates the infowindow when the marker is clicked. We'll only allow
            // one infowindow which will open at the marker that is clicked, and populate based
            // on that markers position.
            function populateInfoWindow(marker, infowindow) {
                // Check to make sure the infowindow is not already opened on this marker.
                if (infowindow.marker != marker) {
                    infowindow.marker = marker;
                    infowindow.setContent('<div>' + marker.title + '<br>' + marker.site + '</div>');
                    infowindow.open(map, marker);
                    // Make sure the marker property is cleared if the infowindow is closed.
                    infowindow.addListener('closeclick',function(){
                        infowindow.setMarker(null);
                    });
                }
            }
            // This function will loop through the markers array and display them all.
            function showListings() {
                var bounds = new google.maps.LatLngBounds();
                // Extend the boundaries of the map for each marker and display the marker
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                    bounds.extend(markers[i].position);
                }
                map.fitBounds(bounds);
            }

            // This function will loop through the listings and hide them all.
            function hideListings() {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }
            }
            // This function takes in a COLOR, and then creates a new marker
            // icon of that color. The icon will be 21 px wide by 34 high, have an origin
            // of 0, 0 and be anchored at 10, 34)

            function makeMarkerIcon(markerColor) {
                var markerImage = new google.maps.MarkerImage(
                    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
                    '|40|_|%E2%80%A2',
                    new google.maps.Size(21, 34),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(10, 34),
                    new google.maps.Size(21,34));
                return markerImage;
            }
