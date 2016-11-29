// Days names to associate to each index. 1 -> Mon, 2 -> Tue etc.
var days = ['None', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Hexadecimal color values to associate to each category id.
var colors = {
    '4d4b7105d754a06374d81259': '#f44336', // Food

    '4d4b7105d754a06376d81259': '#e91e63', // Nightlife

    '4d4b7105d754a06377d81259': '#673ab7', // Outdoor

    '4d4b7105d754a06375d81259': '#009688', // Workplace

    '4e67e38e036454776db1fb3a': '#4caf50', // Home

    '4d4b7105d754a06378d81259': '#9c27b0', // Shopping

    '4d4b7105d754a06379d81259': '#795548', // Travel

    '4d4b7104d754a06370d81259': '#00bcd4', // Culture

    '4d4b7105d754a06372d81259': '#607d8b', // Education

    '4d4b7105d754a06373d81259': '#9e9e9e' // Event
}

// Marker image URLs to associate to each category id.
var markers = {
    '4d4b7105d754a06374d81259': 'img/food_marker.png', // Food

    '4d4b7105d754a06376d81259': 'img/nightlife_marker.png', // Nightlife

    '4d4b7105d754a06377d81259': 'img/exterior_marker.png', // Outdoor

    '4d4b7105d754a06375d81259': 'img/workplace_marker.png', // Workplace

    '4e67e38e036454776db1fb3a': 'img/home_marker.png', // Home

    '4d4b7105d754a06378d81259': 'img/shopping_marker.png', // Shopping

    '4d4b7105d754a06379d81259': 'img/travel_marker.png', // Travel

    '4d4b7104d754a06370d81259': 'img/culture_marker.png', // Culture

    '4d4b7105d754a06372d81259': 'img/education_marker.png', // Education

    '4d4b7105d754a06373d81259': 'img/event_marker.png' // Event
};

// Cache to preload marker icons.
var markersCache = {};