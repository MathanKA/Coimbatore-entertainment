/**
 * @fileoverview view model for the neighborhood map.
 * @author ftchirou@gmail.com (Faiçal Tchirou)
 */

/**
 * NeighborhoodViewModel class.
 * The main view model of the app.
 * @constructor
 */
var NeighborhoodViewModel = function () {
    var self = this;

    /**
     * Whether the app is loading and searching for places.
     * @type {boolean}
     */
    self.loading = ko.observable(true);

    /**
     * Whether an error occured during an API call.
     * @type {boolean}
     */
    self.error = ko.observable(false);

    /**
     * The error to be displayed to the user if self.error equals true.
     * @type {string}
     */
    self.errorText = ko.observable('Fucked up');

    /**
     * The neighborhood the user is exploring.
     * @type {object}
     */
    self.neighborhood = {
        /**
         * The name of the neighborhood.
         * @type {string}
         */
        name: ko.observable('Udacity'),

        /**
         * The coordinates of the neighborhood.
         * #type {google.maps.LatLngLiteral}
         */
        location: {
            lat: 37.399864,
            lng: -122.10840000000002
        }
    };

    /**
     * The map of the app.
     * @type {google.maps.Map}
     */
    self.map = null;

    /**
     * The value of the input used to switch neighborhood.
     * @type {string}
     */
    self.switchInputValue = ko.observable('');

    /**
     * The value of the search input (the input used to filter the list of places).
     * @type {string}
     */
    self.searchInputValue = ko.observable('');

    /**
     * The list of category (food, nightlife, ...) of places available in this neighborhood.
     * @type {Array.<object>}
     */
    self.categories = ko.observableArray([]);

    /**
     * Whether this neighborhood has at least one place or not.
     * @type {Array.<object>}
     */
    self.hasPlaces = ko.observable(true);

    /**
     * Initializes the app.
     * Loads the map, loads all possible categories, finds all the places available in the
     * default neighborhood and displays them.
     * @return {void}
     */
    self.initialize = function () {

        var mapOptions = {
            disableDefaultUI: true,
            center: self.neighborhood.location,
            zoom: 18,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER,
                style: google.maps.ZoomControlStyle.DEFAULT
            }
        };

        self.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

        /**
         * Loads all possible categories available and initializes each of them.
         */
        self.getCategories(function (categories) {

            categories.forEach(function (category) {
                /**
                 * Whether the list items and the map markers of
                 * this category are visible or not.
                 * @type {boolean}
                 */
                category.isVisible = ko.observable(true);

                /**
                 * A helper computed observable to know if this
                 * category's places and their map markers should
                 * be hidden.
                 * @type {boolean}
                 */
                category.isHidden = ko.computed(function () {
                    return !category.isVisible();
                });

                /**
                 * Shows or hides this category's places and their
                 * map markers.
                 * @return {void}
                 */
                category.toggleVisibility = function () {
                    // Toggles the category visibility.
                    this.isVisible(!category.isVisible());

                    // For each place in this category
                    this.places().forEach(function (place) {

                        if (place.infoWindowOpened()) {
                            // Close the place's info window.
                            place.infoWindow.close();

                            // Set the place marker icon to its default icon.
                            place.marker.setIcon(place.markerIcon);

                            // Notify that the place info window has just been closed.
                            place.infoWindowOpened(false);
                        }

                        if (place.matchesQuery()) {
                            // Toggle the place marker visibility, but only if
                            // the place matches the current user search query
                            // because the marker is already hidden if the place
                            // does not match the search query.
                            place.marker.setVisible(category.isVisible());
                        }
                    });
                };

                /**
                 * The list of places in this category.
                 * @type {Array.<object>}
                 */
                category.places = ko.observableArray([]);

                /**
                 * Lists the places in this
                 * category which match the current user search query.
                 * @return {Array.<object>}
                 */
                category.placesMatchingQuery = ko.computed(function () {
                    var places = [];

                    // For each place in the category ...
                    category.places().forEach(function (place) {
                        /**
                         * Whether the place matches the user search query.
                         * @type {boolean}
                         */
                        var match = place.matchesQuery();

                        // Toggle the place's marker visibility.
                        // The marker is visible if the place matches the query
                        // and hidden if not.
                        place.marker.setVisible(match && category.isVisible());

                        // If the place matches the user search query,
                        // insert it into the result.
                        if (match) {
                            places.push(place);
                        } else {
                            // If the place does not match the query and
                            // has his info window opened before the user
                            // starts the query, close the info window.
                            if (place.infoWindowOpened()) {
                                place.infoWindow.close();
                                place.marker.setIcon(place.markerIcon);
                                place.infoWindowOpened(false);
                            }
                        }
                    });

                    return places;
                });

                /**
                 * Returns the category icon (of size 44x44) URL to be used in html
                 * <img> elements.
                 * @return {string}
                 */
                category.headerIcon = ko.computed(function () {
                    /**
                     * The object to use to build the icon URL.
                     * It has the properties:
                     *    prefix: the first part of the URL.
                     *    suffix: the last part of the URL.
                     * These 2 parts should be combined with a size to
                     * obtain the full icon URL.
                     */
                    var icon = category.icon;
                    return icon.prefix + '44' + icon.suffix;
                });

                /**
                 * Returns the display name of the category. If the category name is longer than 22 characters, the
                 * name is truncated and returned, if not, it is returned as is.
                 * In the case where the name is truncated, the user can always see the full name by hovering on the
                 * display name in the app.
                 * @return {string}
                 */
                category.displayName = ko.computed(function () {
                    return category.pluralName.length > 22 ? category.pluralName.substring(0, 18) + ' \u2026' : category.pluralName;
                });
            });

            // Notify that the categories contents have changed.
            self.categories(categories);

            // Find the places in the default neighborhood.
            self.findPlaces(self.neighborhood);

            // Make possible to switch neighborhood.
            self.activateNeighborhoodSwitch();
        });
    };

    /**
     * Binds the google maps "places_changed" event to the neighborhood input
     * @return {void}
     */
    self.activateNeighborhoodSwitch = function () {
        /**
         * The HTML input box used to switch neighborhood.
         * @type {HTMLElement}
         */
        var input = document.getElementById('neighborhood');

        /**
         * The input is used to initialize a SearchBox object.
         * @type {google.maps.places.SearchBox}
         */
        var searchBox = new google.maps.places.SearchBox(input);

        google.maps.event.addListener(searchBox, 'places_changed', function () {
            // Clear each category's places array before switching to another neighborhood.
            self.categories().forEach(function (category) {

                // Remove the markers from the map.
                category.places().forEach(function (place) {
                    place.marker.setMap(null);
                    place.marker = null;
                });

                category.places([]);
            });

            /**
             * The list of places matching the neighborhood entered by the user.
             * Generally, this list is composed of only 1 element.
             * @type {Array.<object}
             */
            var places = searchBox.getPlaces();

            // Update the switch input value to the empty string
            // so that the updated placeholder of the input is visible.
            self.switchInputValue('');

            if (places.length === 0) {
                return;
            }

            // Pick the first result.
            var place = places[0];

            // Update the neighborhood with the place name
            // and its location.
            if (place.hasOwnProperty('geometry')) {
                var geometry = place.geometry;

                if (geometry.hasOwnProperty('location')) {
                    var location = geometry.location;

                    self.neighborhood.name(place.name);
                    self.neighborhood.location.lat = location.lat();
                    self.neighborhood.location.lng =  location.lng();

                    // Switch to the updated neighborhood.
                    self.switchNeighborhood(self.neighborhood);
                }
            }
        });
    };

    /**
     * Switches to the neighborhood given in parameter.
     * Pans the map to the neighborhood location and
     * finds and displays the places available in the neighborhood.
     * @param {object} neighborhood The neighborhood to switch to.
     * @return {void}
     */
    self.switchNeighborhood = function (neighborhood) {
        self.map.panTo(neighborhood.location);
        self.findPlaces(neighborhood);
    };

    /**
     * Finds and displays the places available in the neighborhood given in
     * parameters. Also, builds the info window of each place.
     * @param {object} neighborhood The neighborhood in which to find the places.
     * @return {void}
     */
    self.findPlaces = function (neighborhood) {

        // Notify that the app is searching for places.
        self.loading(true);

        // We suppose that places will be found.
        self.hasPlaces(true);

        /**
         * Builds a place info window to be shown when the place's marker is clicked.
         * @param {object} place The place to build the info window for.
         * @return {google.maps.InfoWindow}
         */
        var infoWindow = function (place) {
            // First add the name of the place in its info window content.
            var content = '<div class="place-info"><h4>' + place.name + '</h4>';

            // Add the titles of the categories this place belongs to.
            if (place.categories.length > 0) {
                content += '<h5 class="categories-titles">' + place.categories[0].name;
                for (var i = 1; i < place.categories.length; ++i) {
                    var category = place.categories[i];
                    content += ', ' + category.pluralName;
                }
                content += '</h5>';
            }

            // Add the place's address.
            if (place.location.formattedAddress.length > 0) {
                content += '<br><address>';
                place.location.formattedAddress.forEach(function (address) {
                    content += address + '<br>';
                });
                content += '</address>';
            }

            // Add the place's opening days and hours.
            if (place.hasOwnProperty('hours')) {

                place.hours.timeframes.forEach(function (timeframe) {
                    content += '<div class="timeframe">';

                    var days = timeframe.daysOpen[0];

                    for (var i = 1; i < timeframe.daysOpen.length; ++i) {
                        days += ' - ' + timeframe.daysOpen[i];
                    }

                    content += '<p>' + days + '</p>';
                    content += '<p>' + timeframe.open.start + ' - ' + timeframe.open.end + '</p>';

                    content += '</div>';

                });

            }

            content += '</div>';

            return new google.maps.InfoWindow({content: content});
        };

        // Retrieves the places in the given neighborhood using the Foursquare API.
        apis.foursquare.getPlacesIn(neighborhood.location, function (places) {
            if (places.length <= 0) {
                self.hasPlaces(false);
                self.loading(false);

                return;
            }

            self.hasPlaces(true);

            // For each retrieved place
            places.forEach(function (place) {

                /**
                 * Checks if the place matches the current user search query.
                 * The place matches the user query if one of the category it
                 * belongs to contains the search query. If not, the place can
                 * still match the query if its name starts with the query.
                 * @return {boolean} Whether the place matches the search query.
                 */
                place.matchesQuery = ko.computed(function () {

                    var query = self.searchInputValue().toLowerCase();

                    for (var i = 0; i < place.categories.length; ++i) {
                        if (place.categories[i].name.toLowerCase().search(query) != -1) {
                            return true;
                        }
                    }

                    return place.name.substring(0, query.length).toLowerCase() === query;
                });

                // Retrieves the photo of the place using the Foursquare API.
                apis.foursquare.getPhotosOf(place, function (photos) {

                    // Add a new property to place to hold the list of the place's photos.
                    place.photos = photos.items;

                    /**
                     * Returns the URL of an image to use as thumbnail for this place
                     * if available.
                     * @return {string}
                     */
                    place.thumbnail = ko.computed(function () {
                        if (place.photos.length <= 0) {
                            return '';
                        }

                        // Use the first photo.
                        var photo = place.photos[0];

                        // Returns the URL of an image of size 100x100 to be used as thumbnail.
                        return photo.prefix + '100x100' + photo.suffix;
                    });

                    // Add some helper properties to each photo.
                    for (var i = 0; i < place.photos.length; ++i) {
                        var photo = place.photos[i];

                        // The position of the photo in the array.
                        // This property will be useful when building the HTML modal
                        // which allows to slide the photos.
                        photo.position = i;

                        // The id of the place this photo belongs to.
                        photo.placeId = place.id;

                        /**
                         * Returns the URL of an image of size 500x500 to be used in the
                         * photos slideshow.
                         * @return {string}
                         */
                        photo.preview = ko.computed(function () {
                            return photo.prefix + '500x500' + photo.suffix;
                        });
                    }

                    /**
                     * Returns a comma-separated string of the categories the place
                     * belongs to.
                     * @return {string}
                     */
                    place.formattedCategories =  ko.computed(function () {
                        if (place.categories.length <= 0) {
                            return '';
                        }

                        var list = place.categories[0].name;
                        for (var i = 1; i < place.categories.length; ++i) {
                            list += ', ' + place.categories[i];
                        }

                        return list;
                    });

                    // Retrieves the open days and hours of this place.
                    apis.foursquare.getHoursOf(place, function (hours) {

                        /**
                         * Formats a string HHMM as HH h MM.
                         * @return {string}
                         */
                        var formatHour = function (hour) {
                            return hour.substring(0, 2) + ' h ' + hour.substring(2);
                        };

                        // The timeframes property of "hours" hold the actual open days and hours.
                        if (hours.hasOwnProperty('timeframes')) {

                            hours.timeframes.forEach(function (timeframe) {
                                // The property days of timeframe is an array of integer,
                                // each integer corresponding to a day in the weed, 1 for Monday,
                                // 2 for Tuesday etc.
                                if (timeframe.hasOwnProperty('days')) {
                                    /**
                                     * An array of string representing the open days.
                                     * e.g. Mon, Tue, Sat, ...
                                     * @type {Array.<string}
                                     */
                                    timeframe.daysOpen = [];

                                    // For each day index in the time frame
                                    timeframe.days.forEach(function (day) {
                                        // Inserts the string representation of the day index in daysOpen.
                                        timeframe.daysOpen.push(days[day]);
                                    });

                                    // The start hour of this timeframe.
                                    timeframe.open.start = formatHour(timeframe.open[0].start);

                                    // The end hour of this timeframe.
                                    timeframe.open.end = formatHour(timeframe.open[0].end);
                                }
                            });

                            // Add a property to place to hold the open hours.
                            place.hours = hours;
                        }

                        // Add a property to place to hold the place info window.
                        place.infoWindow = infoWindow(place);

                        // Whether the place has his info window opened.
                        place.infoWindowOpened = ko.observable(false);

                        /**
                         * Shows or hides the place's info window.
                         * @return {void}
                         */
                        place.toggleInfoWindow = function () {
                            if (this.infoWindowOpened()) {
                                // Sets the place's marker to its default icon
                                // before closing the info window.
                                place.marker.setIcon(place.markerIcon);

                                // Close the place's info window.
                                this.infoWindow.close();

                                // Notify that the place's info window has just been closed.
                                this.infoWindowOpened(false);

                            } else {
                                // Pan the map to the place location.
                                self.map.panTo(this.location);

                                // Indicates that the place is selected by changing its marker icon.
                                place.marker.setIcon(place.markerIcon.substring(0, place.markerIcon.length - 4) + '_selected.png');

                                // Open the place's info window.
                                this.infoWindow.open(self.map, this.marker);

                                // Notify that the place's info window has just been opened.
                                this.infoWindowOpened(true);
                            }
                        };

                        // For each category, checks if the place belongs to it.
                        // If yes, add the place to the category places array.
                        self.categories().forEach(function (category) {

                            // Checks if the place is in 'category'.
                            if (self.isPlaceInCategory(category, place)) {
                                // A property to hold the place's marker icon.
                                // Initializes it to the appropriate icon depending
                                // on the category.
                                place.markerIcon = markers[category.id];

                                // A property to hold the place's marker.
                                place.marker = new google.maps.Marker({
                                    map: self.map,
                                    title: place.name,
                                    position: {
                                        lat: place.location.lat,
                                        lng: place.location.lng
                                    },
                                    icon: place.markerIcon
                                });

                                // Preload the marker icon for the selected state of the place
                                // to avoid display delays.
                                if (!markersCache.hasOwnProperty(category.id)) {
                                    markersCache[category.id] = new Image();
                                    markersCache[category.id].src = place.markerIcon.substring(0, place.markerIcon.length - 4) + '_selected.png';
                                }

                                // Binds the place to this category.
                                category.places.push(place);
                                place.categories.push(category);
                            }
                        });

                        // Open the info window when the place's marker is clicked.
                        if (place.hasOwnProperty('marker')) {
                            google.maps.event.addListener(place.marker, 'click', function () {

                                if (!place.infoWindowOpened()) {
                                    place.infoWindow.open(self.map, place.marker);

                                    var icon = place.marker.getIcon();

                                    place.marker.setIcon(icon.substring(0, icon.length - 4) + '_selected.png');

                                    place.infoWindowOpened(true);

                                    document.getElementById(place.id).scrollIntoView();
                                }
                            });
                        }

                        // Update the place's marker icon when the place's info window is closed.
                        google.maps.event.addListener(place.infoWindow, 'closeclick', function () {
                            place.marker.setIcon(place.markerIcon);
                            place.infoWindowOpened(false);
                        });

                        // We have retrieved all the places.
                        self.loading(false);
                    }, self.handleError);
                }, self.handleError);
            });

        }, self.handleError);

    };

    /**
     * Checks if a place belongs to a category.
     * @param {object} category The category to check in.
     * @param {object} place The place to check for.
     * @return {boolean} Whether the place belongs to the category.
     */
    self.isPlaceInCategory = function (category, place) {
        // A place belongs to a category if one of its categories
        // is a sub-category of that category.
        for (var i = 0; i < place.categories.length; ++i) {
            if (self.isSubCategoryOf(category, place.categories[i])) {
                return true;
            }
        }

        return false;
    };

    /**
     * Checks if a category is a sub-category of a category.
     * @param {category} The category to check in.
     * @param {subcat} The category to check for.
     * @return {boolean} Whether subcat is a sub-category of category.
     */
    self.isSubCategoryOf = function (category, subcat) {
        // A category is a sub-category of itself.
        if (subcat.id === category.id) {
            return true;
        }

        if (category.hasOwnProperty('categories')) {
            for (var i = 0; i < category.categories.length; ++i) {
                if (self.isSubCategoryOf(category.categories[i], subcat)) {
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * Retrieves all the possible top-level categories a place can belong to.
     * @param {function(Array.<object>)} The callback to call once the categories have been retrieved.
     * @return {void}
     */
    self.getCategories = function (callback) {
        /**
         * Whether to make an API call to retrieve the categories.
         * @type {boolean}
         */
        var fetch = Modernizr.localstorage && localStorage.getItem('categories') === null;

        if (!fetch) {
            if (callback) {
                // The categories have been fetched before and cached.
                // We can just retrieve them and pass them to the callback.
                callback(JSON.parse(localStorage.getItem('categories')));
            }

        } else {
            // Retrieves the top-level categories with the Foursquare API.
            apis.foursquare.getCategories(function (categories) {
                // If possible, cache the categories in local storage.
                if (Modernizr.localstorage) {
                    localStorage.setItem('categories', JSON.stringify(categories));
                }

                if (callback) {
                    callback(categories);
                }
            }, self.handleError);
        }
    };

    /**
     * Notifies that there was an error in an API call.
     * @param {object} error The error returned by the API.
     * @return {void}
     */
    self.handleError = function (error) {
        self.loading(false);

        if (error) {
            console.log(error);

            if (typeof error === 'object') {
                self.errorText('Can not retrieve all the places. Please reload the page.');

            } else if (typeof error === 'string') {
                self.errorText(error);
            }
        }

        self.error(true);
    };


    // Initialize the app once the DOM and the Google Maps API is successfully loaded. If not, display an error.
    if (typeof google === 'object' && typeof google.maps === 'object'
            && typeof google.maps.event === 'object' && typeof google.maps.places === 'object') {
        google.maps.event.addDomListener(window, 'load', this.initialize);
    } else {
        self.handleError('Can not load the map. Please reload the page.');
    }
};

$(document).ready(function () {
   ko.applyBindings(new NeighborhoodViewModel());
});