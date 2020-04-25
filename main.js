$(document).ready(function() {

    $('.search').each(function() {
        var self = $(this);
        var div = self.children('div');
        var placeholder = div.children('input').attr('placeholder');
        var placeholderArr = placeholder.split(/ +/);
        if (placeholderArr.length) {
            var spans = $('<div />');
            $.each(placeholderArr, function(index, value) {
                spans.append($('<span />').html(value + '&nbsp;'));
            });
            div.append(spans);
        }
        self.click(function() {
            self.addClass('open');
            setTimeout(function() {
                self.find('input').focus();
            }, 750);
        });
        $(document).click(function(e) {
            if (!$(e.target).is(self) && !jQuery.contains(self[0], e.target)) {
                self.removeClass('open');
            }
        });
    });


    $('#search-input').on('keyup', function(e) {
        if (e.keyCode == 13) {
            $('.search').toggle();
            $('.container').toggle(1000);
            var city = $(this).val();
            $(this).val("")
            $.ajax({
                'async': true,
                'crossDomain': true,
                'url': `https://eu1.locationiq.com/v1/search.php?key=07b68917cf92d2&q=${city}&format=json`,
                'method': 'GET',
            }).done(function(response) {
                // console.log(response[0], response[0].lat, response[0]['lon'])
                var location_name = response[0].display_name;
                var city_lat = response[0].lat;
                var city_lon = response[0].lon;
                var proxy = 'https://cors-anywhere.herokuapp.com/'
                $.ajax({
                    'async': true,
                    'crossDomain': true,
                    'data': {
                        'exclude': 'hourly,flags',
                        // 'lang':'az'
                    },
                    'url': proxy + `https://api.darksky.net/forecast/1ad04a716812de5d54f19160b2426d77/${city_lat},${city_lon}`,
                    'method': 'GET',
                }).done(function(response) {
                    console.log(response)
                    var current_date = new Date(response.currently.time * 1000)
                    var week_day = moment(current_date).format('dddd');
                    var today = moment(current_date).format('LL');
                    var temprature = Math.floor((response.currently.temperature - 32) / 1.8)
                    var weather_summary = response.currently.summary
                    $('.week-list').empty()
                    $('.date-dayname').text(week_day);
                    $('.date-day').text(today);
                    $('.weather-temp').text(temprature + '°C');
                    // $('.weather-desc').text(weather_summary);
                    $('.location').text(location_name)
                    $(".humidity_value").text(response.currently.humidity * 100 + "%")
                    $(".windSpeed").text(response.currently.windSpeed + " km/h")
                    $(".precipIntensity").text(response.currently.precipIntensity + "%")
                    var icons = {
                        "partly-cloudy-day": '<i class="fas fa-cloud-sun"></i>',
                        "cloudy": '<i class="fas fa-cloud"></i>',
                        "clear-day": '<i class="fas fa-sun"></i>',
                        "rain": '<i class="fas fa-cloud-rain"></i>',
                        "snow": '<i class="fas fa-snowflake"></i>',
                        "fog": '<i class="fas fa-smog"></i>',
                        "partly-cloudy-night": '<i class="fas fa-cloud-moon"></i>',
                        "wind": '<i class="fas fa-wind"></i>'
                    }

                    var daily_data = response.daily.data
                    for (var i = 0; i < daily_data.length - 1; i++) {
                        var following_days = new Date(daily_data[i].time * 1000)
                        var weather_icons = response.daily.data[i].icon
                        var weed_day_names = following_days.toString().substring(0, 3)
                        var new_li = $(".li").clone()
                        new_li.removeClass("li d-none")
                        var day_name = new_li.find(".day-name")
                        day_name.text(weed_day_names)
                        $(".icons").eq(i).html(icons[weather_icons])
                        var min_temp = Math.floor((response.daily.data[i].temperatureMin - 32) / 1.8);
                        var max_temp = Math.floor((response.daily.data[i].temperatureMax - 32) / 1.8);
                        var temp = Math.floor((min_temp + max_temp) / 2)
                        $(".day-temp").eq(i).text(`${temp}°C`)
                        if (week_day.indexOf(weed_day_names) != -1) {
                            day_name.parent("li").addClass("active")
                        }
                        $(".week-list").append(new_li)

                    }
                    $(".active").children(".day-temp").eq(0).text(temprature + '°C')

                })

            })

        }
    })

    $('.location-button').click(function() {
        $('.search').toggle(500);
        $('.container').toggle(500);
    })
    $('#search-input').val("")

});