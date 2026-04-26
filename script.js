const navButtons = document.querySelectorAll('.nav-btn');
const searchInput = document.querySelector('.search-input');
const cityElement = document.querySelector('.city');
const tempElement = document.querySelector('.temp');
const humidityElement = document.querySelector('.humidity');
const windElement = document.querySelector('.wind');
const precipitationElement = document.querySelector('.precipitation');
const weatherImage = document.querySelector('.weather-image');
const errorElement = document.querySelector('.error');
const weatherElement = document.querySelector('.weather');

const API_KEY = 'c70390ac4a26f6b84b12ac560a085d79';

navButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        navButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const target = document.querySelector(this.dataset.target);
        if (target) {
            target.scrollIntoView({
                block: 'start'
            });
        }
    });
});
//                              !!!!!ПРОГНОЗ ПОГОДЫ ИМЕННО СЕЙЧАС!!!!!
async function checkWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`);

        if (!response.ok) {
            throw new Error('Город не найден');
        }

        const data = await response.json();

        cityElement.textContent = data.name;
        tempElement.innerHTML = `${Math.round(data.main.temp)} &#8451;`;
        humidityElement.textContent = `${data.main.humidity}%`;
        windElement.textContent = `${Math.round(data.wind.speed)} м/с`;

        const rain = data.rain ? data.rain['1h'] || data.rain['3h'] || 0 : 0;
        const snow = data.snow ? data.snow['1h'] || data.snow['3h'] || 0 : 0;
        const precipitation = rain + snow;
        precipitationElement.textContent = `${precipitation > 0 ? precipitation.toFixed(1) : 0} мм`;

        const iconCode = data.weather[0].icon;
        const description = data.weather[0].description;

        updateWeatherImage(iconCode, description);

        errorElement.style.display = 'none';
        weatherElement.style.display = 'block';

        const picClass = getWeatherPictureClass(description);
        const picElement = document.querySelector('.weather-pic');
        picElement.className = 'weather-pic ' + picClass;

        checkTodayForecast(city);
    } catch (error) {
        errorElement.style.display = 'block';
        weatherElement.style.display = 'none';
    }
}

function updateWeatherImage(iconCode, description) {
    weatherImage.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="${description}">`;
    document.querySelector('.weather-desc').textContent = description;
}

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
        checkWeather(searchInput.value.trim());
    }
});

function getWeatherPictureClass(description) {
    const desc = description.toLowerCase();

    if (desc.includes('снег') || desc.includes('снеж') || desc.includes('snow')) {
        return 'snowy';
    }
    if (desc.includes('дождь') || desc.includes('ливень') || desc.includes('rain') || desc.includes('shower')) {
        return 'rainy';
    }
    if (desc.includes('ясно') || desc.includes('солнеч') || desc.includes('clear') || desc.includes('sun')) {
        return 'sunny';
    }
    if (desc.includes('пасмурн') || desc.includes('туч') || desc.includes('overcast') || desc.includes('storm')) {
        return 'overcast';
    }
    return 'cloudy';
}


//           !!!!!!!ПРОГНОЗ ПОГОДЫ НА СЕГОДНЯ!!!!!!!
async function checkTodayForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`);

        if (!response.ok) throw new Error('Город не найден');

        const data = await response.json();
        const today = data.list[0].dt_txt.split(' ')[0];
        const todayList = data.list.filter(item => item.dt_txt.startsWith(today));

        const todayCard = document.querySelector('#today');
        todayCard.innerHTML = '';

        todayList.forEach(item => {
            const time = item.dt_txt.split(' ')[1].slice(0, 5);
            const temp = Math.round(item.main.temp);
            const icon = item.weather[0].icon;
            const desc = item.weather[0].description;

            todayCard.innerHTML += `
                <div class="forecast-item">
                    <p class="forecast-time">${time}</p>
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
                    <p class="forecast-temp">${temp}°C</p>
                    <p class="forecast-desc">${desc}</p>
                </div>
            `;
        });

    } catch (error) {
        console.error('Ошибка прогноза:', error);
    }
}

checkWeather('Минск');