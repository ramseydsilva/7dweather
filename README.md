## Weather Ducky - Weather forecasting app

WeatherDucky is a realtime weather forecasting web application built using HTML(5), CSS(3) and Javascript. A user is able to query the 7 day weather forecast for any city. Daily data is displayed for average/min/max temperature and general weather conditions. Weekly averages for Atmospheric pressure, humidity and wind speed are also displayed.

***

### Requirements

For proper functioning of the webapp, a working internet connection is required as it relies on the [openweather API][openweatherapi]. 

***

### Install

Firstly, clone the repository

```
git clone https://github.com/ramseydsilva/weatherducky
cd weatherducky

```

A simple webserver can be configured to run it. To run using a python web server, run the command at the root of the project:

```
python -m SimpleHTTPServer 4000

```

To see the app, point your browser to http://localhost:4000.

***

### Features
* Realtime weather data
* GeoLocation
* Responsive UI

***

### Libraries and Tools used

* [HTML5 Geolocation][geo]
* [Twitter Bootstrap 3.0.0][bootstrap]
* [Twitter typeahed for Bootstrap][typeahead]
* [JQuery][jquery]
* [requireJS][require]
* [UnderscoreJS][underscore]
* Versioning in [Git][git]

[openweatherapi]: http://openweathermap.org/wiki/API/JSON_API#Get_forecast
[geo]: https://developer.mozilla.org/en/docs/WebAPI/Using_geolocation
[bootstrap]: http://getbootstrap.com/
[typeahead]: https://github.com/bassjobsen/Bootstrap-3-Typeahead
[jquery]: http://jquery.com/
[require]: http://requirejs.org/
[underscore]: http://underscorejs.org/
[git]: http://git-scm.com/

***

### Browser Support

WeatherDucky is tested on the following browsers

* Chrome
* Firefox 3.5+
* Safari 4+
* Opera 11+
* Mobile

***

### Issues

Discovered a bug? Please create an issue here on GitHub!

https://github.com/ramseydsilva/weatherducky/issues

***

### Authors

* [Ramsey D'silva](https://github.com/ramseydsilva) 
