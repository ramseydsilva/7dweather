require.config({
    paths: {
        "jquery": "jquery-2.1.0.min",
        "underscore": "underscore-min",
        "bootstrap": "bootstrap.min",
        "typeahead": "bootstrap3-typeahead.min",
        "purl": "purl",
        "text": "plugins/text"
    },
    shim: {
        "typeahead": ["jquery"],
        "purl": ["jquery"],
        "bootstrap": ["jquery"]
    }
});

define([
    "jquery",
    "underscore",
    "text!templates/day.html",
    "text!templates/summary.html",
    "purl",
    "typeahead",
    "bootstrap"
], function($, _, dayTemplate, summaryTemplate) {
    var locations = [], results = {};
    days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
    images = {  "light rain": 'cloudy_s_rain.png',
                    "light clouds": 'cloudy_s_sunny.png',
                    "scattered clouds": 'cloudy_s_sunny.png',
                    "fog": 'fog.png',
                    "few clouds": 'partly_cloudy.png',
                    "broken clouds": 'partly_cloudy.png',
                    "rain": 'rain.png',
                    "heavy intensity rain": 'rain.png',
                    "rain and clouds": 'rain_s_cloudy.png',
                    "moderate rain": "rain_s_cloudy.png",
                    "snow": 'snow.png',
                    "heavy snow": 'snow.png',
                    "light snow": 'snow_s_cloudy.png',
                    "sky is clear": 'sunny.png',
                    "light sun": 'sunny_s_cloudy.png',
                    "overcast clouds": "cloudy.png"
                };

    function clearResults() {
        $('#title').html("");
        $('#chart').html("");
        $("#summary").html("");
    }

    function displayResults() {
        hideDropDownIfNotNeeded();

        var location = results.city.name;
        if (results.city.name == "" && results.city.country != "")
            location = $("#location").val();
        $('#title').html("Weather Forecast for " + location);
        $('#chart').html("");
        $('#summary').html("");

        var totalTemp = 0, context = {};

        // Display Weekly Data
        var weekData = results.list;
        _.each(weekData, function(dayData) {
            var date = new Date(dayData.dt * 1000);
            var avgTemp = Math.floor((dayData.temp.max + dayData.temp.min) / 2);
            context = {
                day: days[date.getDay()],
                date: months[date.getMonth()] + " " + date.getDate(),
                maxTemp: dayData.temp.max,
                minTemp: dayData.temp.min,
                avgTemp: avgTemp,
                desc: dayData.weather[0].main,
                img: images[dayData.weather[0].description],
                longDesc: dayData.weather[0].description,
                humidity: dayData.humidity,
                pressure: dayData.pressure,
                speed: dayData.speed,
                isFirst: !_.indexOf(weekData, dayData),
                isLast: weekData.length == _.indexOf(weekData, dayData) + 1
            };
            totalTemp += avgTemp;
            $('#chart').append(_.template(dayTemplate, context));
        });

        // Display Weekly Averages
        context = {
            avgTemp: (totalTemp / 7).toFixed(2),
            avgHumidity: (_.reduce(weekData, function(memo, dayData) { return memo + dayData.humidity }, 0) / 7).toFixed(2),
            avgPressure: (_.reduce(weekData, function(memo, dayData) { return memo + dayData.pressure }, 0) / 7).toFixed(2),
            avgSpeed: (_.reduce(weekData, function(memo, dayData) { return memo + dayData.speed }, 0) / 7).toFixed(2)
        }
        $('#summary').html(_.template(summaryTemplate, context));
    }

    function hideDropDownIfNotNeeded() {
        // If location input value matches drop down element, close the drop down
        if ($(".dropdown-menu li").length == 1 && $(".dropdown-menu li").text().toLowerCase() == $("#location").val().toLowerCase())
            $(".dropdown-menu").css("display", "none !important");
    }

    function isLocationPreviouslyFetched(location) {
        return !!_.find(locations, function(savedLocation) { return savedLocation.toLowerCase() == location.toLowerCase(); });
    }

    function fetchData() {
        var location = $("#location").val();

        if (location == "") {
            // Input is blank, clear result pane
            clearResults();
        } else {

            // Check if the location in the input is a real location against the cities previously returned in the dropdown
            if (isLocationPreviouslyFetched(location)) {
                $.ajax({
                    url: "http://api.openweathermap.org/data/2.5/forecast/daily?units=metric&mo&cnt=7&q=" + location,
                    dataType: "jsonp",
                    success: function(data) {
                        if (data.cod == "200") {
                            results = data;
                            displayResults();
                        }
                    },
                    error: function() {
                        // Some error was thrown, need to handle this error
                        clearResults();
                        $("#title").html("An unidentified error has occured, please try again in some time");
                    }
                });
            } else {
                // Not a real location, so clear the result Pane
                clearResults();
                $("#title").html("Is that a real location? Please try again.");
            }
        }
    }

    function fetchLocations(query, callback) {
        $.ajax({
            url: "http://api.openweathermap.org/data/2.5/find?type=like&q=" + query,
            dataType: "jsonp",
            success: function (data) {
                if (data.cod == "200") {
                    var newLocations = _.map(data.list, function(newLocation) {
                        if (newLocation.name == "" && newLocation.country != "")
                            return query; // Location is not a city
                        return newLocation.name; // Location is city
                    });
                    locations = _.union(locations, newLocations);
                    callback(newLocations); // callback is either to show dropdown or fetchData
                    hideDropDownIfNotNeeded();
                }
            }
        });
    }

    function getLocations(query, callback) {
        if (query.length > 2) {
            // Don't bother fetching location for two lettered queries
            if (isLocationPreviouslyFetched(query)) {
                // Check if location was previously returned by API to save making unnecessary calls
                callback();
            } else {
                fetchLocations(query, callback);
            }
        }
    }

    function getLocation(position) {
        var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&callback=?';
        $.getJSON(url, function(location){
            if (location.cod == "200") {
                $("#location").val(location.name);
                fetchLocations(location.name, fetchData);
            }
        });
    }

    $(document).ready(function() {

        $("#location").keyup(function() {
            getLocations($(this).val(), fetchData);
        }).change(function() {
            getLocations($(this).val(), fetchData);
        });

        if (!!$.url().param().location) {
            // city is specified in URL
            var location = $.url().param().location.replace("/", "");
            $("#location").val(location);
            fetchLocations(location, fetchData);
        } else if (navigator.geolocation) {
            // Use HTML5 Geolocation to find users location
            var options = {enableHighAccuracy: false, maximumAge: 15000, timeout: 10000};
            navigator.geolocation.getCurrentPosition(getLocation, function(){}, options);
        }

        $("#location").typeahead({
            displayKey: "name",
            minLength: 3,
            items: "all",
            autoSelect: false,
            source: fetchLocations
        });

    });
});
