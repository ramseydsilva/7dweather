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
    var locations = {}, city = "", title = "", results = [],
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

    function processCity(item) {
        if (typeof locations[item.name.toLowerCase()] == "undefined") {
            locations[item.name.toLowerCase()] = item;
        }
        return item.name;
    }

    function clearResults() {
        $('#title').html("");
        $('#chart').html("");
        $("#summary").html("");
    }

    function displayResults() {
        $('#title').html(title);
        $('#chart').html("");
        $('#summary').html("");

        var totalTemp = 0, context = {};

        // Display Weekly Data
        _.each(results, function(data) {
            var date = new Date(data.dt * 1000);
            var avgTemp = Math.floor((data.temp.max + data.temp.min) / 2);
            context = {
                day: days[date.getDay()],
                date: months[date.getMonth()] + " " + date.getDate(),
                maxTemp: data.temp.max,
                minTemp: data.temp.min,
                avgTemp: avgTemp,
                desc: data.weather[0].main,
                img: images[data.weather[0].description],
                longDesc: data.weather[0].description,
                humidity: data.humidity,
                pressure: data.pressure,
                speed: data.speed,
                isFirst: !_.indexOf(results, data),
                isLast: results.length == _.indexOf(results, data) + 1
            };
            totalTemp += avgTemp;
            $('#chart').append(_.template(dayTemplate, context));
        });

        // Display Weekly Averages
        context = {
            avgTemp: (totalTemp / 7).toFixed(2),
            avgHumidity: (_.reduce(results, function(memo, data) { return memo + data.humidity }, 0) / 7).toFixed(2),
            avgPressure: (_.reduce(results, function(memo, data) { return memo + data.pressure }, 0) / 7).toFixed(2),
            avgSpeed: (_.reduce(results, function(memo, data) { return memo + data.speed }, 0) / 7).toFixed(2)
        }
        $('#summary').html(_.template(summaryTemplate, context));
    }

    function fetchData() {
        city = $("#city").val();

        if (city == "") {
            // Input is blank, clear result pane
            clearResults();
        } else {
            // If single element matches drop down element, close the drop down
            if ($(".dropdown-menu li").length == 1 && $(".dropdown-menu li").text().toLowerCase() == city.toLowerCase())
                $(".dropdown-menu").css("display", "none !important");

            // Check if the city in the input is a real city against the cities returned in the dropdown
            if (typeof locations[city.toLowerCase()] != "undefined") {
                $.ajax({
                    url: "http://api.openweathermap.org/data/2.5/forecast/daily?units=metric&mo&cnt=7&q=" + city,
                    dataType: "jsonp",
                    success: function(data) {
                        if (data.cod == "200") {
                            title = "Weather Forecast for " + data.city.name;
                            results = data.list;
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

    function getLocation(position) {
        var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&callback=?';
        $.getJSON(url, function(data){
            city = data.name;
            locations[city.toLowerCase()] = "";
            $("#city").val(city).trigger("change");
        });
    }

    $(document).ready(function() {

        $("#city").keyup(function() {
            fetchData();
        });

        $("#city").change(function() {
            fetchData();
        });

        if (!!$.url().param().city) {
            // City is specified in URL
            city = $.url().param().city.replace("/", "");
            locations[city.toLowerCase()] = "";
            $("#city").val(city).trigger("change");
        } else if (navigator.geolocation) {
            // Use HTML5 Geolocation to find users city
            navigator.geolocation.getCurrentPosition(getLocation);
        }

        $("#city").typeahead({
            displayKey: "name",
            minLength: 3,
            items: "all",
            autoSelect: false,
            source: function(query, process) {
                $.ajax({
                    url: "http://api.openweathermap.org/data/2.5/find?type=like&q=" + query,
                    dataType: "jsonp",
                    success: function (data) {
                        process(_.map(data.list, processCity));
                    }
                });
            }
        });

    });
});
