/**
 * Holds the apis used by the app.
 */
var apis = {};

// The Foursquare API
apis.foursquare = {
    clientId: 'GQVM3TG2JHRG53PTWCZSCQDKUKQJH34I1BUOJOLLHOSBL1Q0',

    clientSecret: 'M41YZKEES3UIG4QYWVMQ0HQIMUPD0G1YD5ZSQTYUPJLVG4DD',

    /**
     * Retrieves the Foursquare top-level categories.
     * @param {function(categories)} successCallback The function to call if the request is successful.
     * @param {function(error)} errorCallback The function to call if there was an error.
     * @return {void}
     */
    getCategories: function (successCallback, errorCallback) {
        var endpoint = 'https://api.foursquare.com/v2/venues/categories?client_id='
            + this.clientId
            + '&client_secret='
            + this.clientSecret
            + '&v=20140806&m=foursquare';

        this.get('categories', endpoint, successCallback, errorCallback);
    },

    /**
     * Retrieves the places available in a neighborhood using the Foursquare API.
     * @param {object} neighborhood The neighborhood in which places will be searched.
     * @param {function(places)} successCallback The function to call if the request is successful.
     * @param {function(error)} errorCallback The function to call if there was an error.
     * @return {void}
     */
    getPlacesIn: function (neighborhood, successCallback, errorCallback) {
        var endpoint = 'https://api.foursquare.com/v2/venues/search?client_id=' + this.clientId 
            + '&client_secret=' 
            + this.clientSecret
            + '&ll=' + neighborhood.lat + ','
            + neighborhood.lng
            + '&v=20140806&m=foursquare';

        this.get('venues', endpoint, successCallback, errorCallback);
    },

    /**
     * Retrieves all the photos URLs of a place using the Foursquare API.
     * @param {object} place The place to retrieve the photos for.
     * @param {function(photos)} successCallback The function to call if the request is successful.
     * @param {function(error)} errorCallback The function to call if there was an error.
     * @return {void}
     */
    getPhotosOf: function (place, successCallback, errorCallback) {
        var endpoint = 'https://api.foursquare.com/v2/venues/' + place.id + '/photos?client_id='
            + this.clientId + '&client_secret=' + this.clientSecret + '&v=20140806&m=foursquare';

        this.get('photos', endpoint, successCallback, errorCallback);
    },

    /**
     * Retrieves the open hours of a place using the Foursquare API.
     * @param {object} place The place to retrieve the photos for.
     * @param {function(photos)} successCallback The function to call if the request is successful.
     * @param {function(error)} errorCallback The function to call if there was an error.
     * @return {void}
     */
    getHoursOf: function (place, successCallback, errorCallback) {
        var endpoint = 'https://api.foursquare.com/v2/venues/' + place.id + '/hours?client_id='
            + this.clientId + '&client_secret=' + this.clientSecret + '&v=20140806&m=foursquare';

        this.get('hours', endpoint, successCallback, errorCallback);
    },

    /**
     * Make a GET request to a Foursquare API endpoint.
     * @param {string} resource The name of the resource to retrieve from the response.
     * @param {string} endpoint The URL of the endpoint.
     * @param {function(resource)} successCallback The function to call if the request is successful.
     * @param {function(error)} errorCallback The function to call if there was an error.
     * @return {void}
     */
    get: function(resource, endpoint, successCallback, errorCallback) {
        $.get(endpoint)
            .done(function (data) {
                var meta = data.meta;

                if (meta.code === 200) {
                    if (successCallback) {
                        successCallback(data.response[resource]);
                    }

                } else {
                    if (errorCallback) {
                        errorCallback({errorType: meta.errorType, errorDetail: meta.errorDetail});
                    }
                }
            })
            .fail(function () {
                errorCallback('Can not retrieve places. Please reload the page.');
            });
    }
};