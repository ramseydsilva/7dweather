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
    var cities = [], results = {};
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
        $('#title').html("Weather Forecast for " + results.city.name);
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
        // If city input value matches drop down element, close the drop down
        if ($(".dropdown-menu li").length == 1 && $(".dropdown-menu li").text().toLowerCase() == $("#city").val().toLowerCase())
            $(".dropdown-menu").css("display", "none !important");
    }

    function fetchData() {
        var city = $("#city").val();

        if (city == "") {
            // Input is blank, clear result pane
            clearResults();
        } else {
            hideDropDownIfNotNeeded();

            // Check if the city in the input is a real city against the cities previously returned in the dropdown
            if (_.find(cities, function(savedCity) { return savedCity.toLowerCase() == city.toLowerCase(); })) {
                $.ajax({
                    url: "http://api.openweathermap.org/data/2.5/forecast/daily?units=metric&mo&cnt=7&q=" + city,
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
                // Not a real city, so clear the result Pane
                clearResults();
                $("#title").html("Is that a real city? Please try again.");
            }
        }
    }

    function fetchCities(query, callback) {
        $.ajax({
            url: "http://api.openweathermap.org/data/2.5/find?type=like&q=" + query,
            dataType: "jsonp",
            success: function (data) {
                var newCities = _.map(data.list, function(newCity) { return newCity.name });
                cities = _.union(cities, newCities);
                callback(newCities); // callback is either to show dropdown or fetchData
                hideDropDownIfNotNeeded();
            }
        });
    }

    function getLocation(position) {
        var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&callback=?';
        $.getJSON(url, function(city){
            $("#city").val(city.name);
            fetchCities(city.name, fetchData);
        });
    }

    $(document).ready(function() {

        $("#city").keyup(fetchData).change(fetchData);

        if (!!$.url().param().city) {
            // City is specified in URL
            var city = $.url().param().city.replace("/", "");
            $("#city").val(city);
            fetchCities(city, fetchData);
        } else if (navigator.geolocation) {
            // Use HTML5 Geolocation to find users city
            navigator.geolocation.getCurrentPosition(getLocation);
        }

        $("#city").typeahead({
            displayKey: "name",
            minLength: 3,
            items: "all",
            autoSelect: false,
            source: fetchCities
        });

    });
});
