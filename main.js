require.config({
    paths: {
        "jquery": "js/jquery-1.11.0.min",
        "underscore": "js/underscore-min",
        "bootstrap": "js/bootstrap.min",
        "typeahead": "js/bootstrap3-typeahead.min",
        "text": "js/plugins/text"
    },
    shim: {
    }
});

define([
    "jquery",
    "underscore",
    "text!js/templates/day.html",
    "typeahead",
    "bootstrap"
], function($, _, dayTemplate) {
    var locations = {};
    var city = "";
    var title = "";
    var results = [];
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var images = {  "light rain": 'cloudy_s_rain.png',
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

    function processItem(item) {
        if (typeof locations[item.name.toLowerCase()] == "undefined") {
            locations[item.name.toLowerCase()] = item;
        }
        return item.name;
    }
    function clearResults() {
        title = "";
        $('#title').html(title);
        $('#chart').html("");
    }

    function displayResults() {
        $('#title').html(title);
        $('#chart').html("");
        _.each(results, function(data) {
            var date = new Date(data.dt * 1000);
            var context = {
                day: days[date.getDay()],
                date: months[date.getMonth()] + " " + date.getDate(),
                maxTemp: data.temp.max,
                minTemp: data.temp.min,
                avgTemp: Math.floor((data.temp.max + data.temp.min) / 2),
                desc: data.weather[0].main,
                img: images[data.weather[0].description],
                longDesc: data.weather[0].description,
                isFirst: !_.indexOf(results, data)
            };
            $('#chart').append(_.template(dayTemplate, context));
        });
    }

    function fetchResults() {
        city = $("#city").val();
        if (typeof locations[city.toLowerCase()] != "undefined") {
            $.ajax({
                url: "http://api.openweathermap.org/data/2.5/forecast/daily?units=metric&mo&cnt=7&q=" + city,
                dataType: "jsonp",
                success: function(data) {
                    if (data.cod == "200") {
                        title = "Displaying Weather Forecase for " + city;
                        results = data.list;
                    }
                },
                complete: function(data) {
                    displayResults();
                }
            });
        } else {
            clearResults();
        }
    }

    $(document).ready(function() {
        $("#city").typeahead({
            displayKey: "name",
            minLength: 3,
            items: "all",
            source: function(query, process) {
                $.ajax({
                    url: "http://api.openweathermap.org/data/2.5/find?type=like&q=" + query,
                    dataType: "jsonp",
                    success: function (data) {
                        process(_.map(data.list, processItem));
                        fetchResults();
                    }
                });
            }
        });

        $("#city").on({
            keyUp: fetchResults,
            change: fetchResults
        });
    });
});
