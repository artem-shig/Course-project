const navButtons = document.querySelectorAll('.nav-btn');
const searchInput = document.querySelector('.search-input');
const cityElement = document.querySelector('.city');
const timeElement = document.querySelector('.current-time');
const tempElement = document.querySelector('.temp');
const humidityElement = document.querySelector('.humidity');
const windElement = document.querySelector('.wind');
const precipitationElement = document.querySelector('.precipitation');
const weatherImage = document.querySelector('.weather-image');
const errorElement = document.querySelector('.error');
const weatherElement = document.querySelector('.weather');

const API_KEY = 'c70390ac4a26f6b84b12ac560a085d79';
//                    !!!!!ТУТ Я ДЕЛАЮ КРАСИВЫЕ КНОПОЧКИ И ПРЕЕДВИГАЮСЬ К ОПРЕДЕЛННЫМ ЭЛЕМЕНТАМ ПРИ ИХ НАЖАТИИ!!!!!!!
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
        tempElement.textContent = `${Math.round(data.main.temp)} ℃`;
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
        checkTomorrowForecast(city);
        checkWeekForecast(city);
    } catch (error) {
        errorElement.style.display = 'block';
        weatherElement.style.display = 'none';
    }
}
//                          !!!!!!!!ЭТО ПРОСТО МИНИ-ИЗОБРАЖЕНИЕ ПОГОДЫ С ЕЕ ОПИСАНИЕМ ИЗ OPENWEATHERMAP
function updateWeatherImage(iconCode, description) {
    weatherImage.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="${description}">`;
    document.querySelector('.weather-desc').textContent = description;
}
//                          !!!!!!!ДОБАВИЛ ПОИСК ПО НАЖАТИЮ ЭНТЕРА И ЗАПРАШИВАЮ ДАННЫЕ С АПИ ПРИ ВЕРНОМ ОРГУМЕНТЕ(ГОРОДЕ)!!!!!!
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
        checkWeather(searchInput.value.trim());
    }
});
//                           !!!!!!!!ТЕКУЩЕЕ ВРЕМЯ ДЛЯ КАРТОЧКИ СЕЙЧАС!!!!!!!!
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    timeElement.textContent = `${hours}:${minutes}`;
}
updateTime();
setInterval(updateTime, 60000);
//                      !!!!!!!!!ПРОСТО ОПИСАНИЕ ПОГОДЫ, КОТОРОЕ НЕОБХОДИМО ДЛЯ ФОНОВОГО ИЗОБРАЖЕНИЯ В КАРТОЧКЕ "СЕГОДНЯ"!!!!!!!!!
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
//                                   !!!!!!!ПРОГНОЗ ПОГОДЫ НА СЕГОДНЯ!!!!!!!
async function checkTodayForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`);

        if (!response.ok) throw new Error('Город не найден');

        const data = await response.json();
        document.querySelector('.second').setAttribute('data-city', data.city.name);
        const today = data.list[0].dt_txt.split(' ')[0];
        const todayDesc = new Date(today);
        const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
        const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        const dateStr = `${days[todayDesc.getDay()]}, ${todayDesc.getDate()} ${months[todayDesc.getMonth()]}`;

        document.querySelector('.second').setAttribute('data-date', dateStr);
        const todayList = data.list.filter(item => item.dt_txt.startsWith(today));
        const todayCard = document.querySelector('#today');
        todayCard.innerHTML = '';

        todayList.forEach(item => {
            const time = item.dt_txt.split(' ')[1].slice(0, 5);
            const temp = Math.round(item.main.temp);
            const icon = item.weather[0].icon;
            const desc = item.weather[0].description;
            const rain = item.rain ? item.rain['3h'] || 0 : 0;
            const snow = item.snow ? item.snow['3h'] || 0 : 0;
            const precipitation = rain + snow;
            const precipText = precipitation > 0 ? `${precipitation.toFixed(1)} мм` : '0 мм';

            todayCard.innerHTML += `
                <div class="forecast-item">
                    <p class="forecast-time">${time}</p>
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
                    <p class="forecast-temp">${temp}°C</p>
                    <p class="forecast-desc">${desc}</p>
                    <p class="forecast-precip">${precipText}</p>
                </div>
            `;
        });

    } catch (error) {
        console.error('Ошибка прогноза:', error);
    }
}
//                              !!!!!!!!!!!!!!!!!ПРОГНОЗ ПОГОДЫ НА ЗАВТРА(ИДЕНТИЧЕН ПРОГНОЗУ НА СЕГОДНЯ, ПРОСТО + 1 ДЕНЬ В ДАТУ!!!!!!!!!!
async function checkTomorrowForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`);

        if (!response.ok) throw new Error('Город не найден');

        const data = await response.json();
        document.querySelector('.third').setAttribute('data-city', data.city.name);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
        const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        const dateStr = `${days[tomorrow.getDay()]}, ${tomorrow.getDate()} ${months[tomorrow.getMonth()]}`;

        document.querySelector('.third').setAttribute('data-city', data.city.name);
        document.querySelector('.third').setAttribute('data-date', dateStr);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const tomorrowList = data.list.filter(item => item.dt_txt.startsWith(tomorrowStr));
        const tomorrowCard = document.querySelector('#tomorrow-forecast');
        tomorrowCard.innerHTML = '';

        if (tomorrowList.length === 0) {
            tomorrowCard.innerHTML = '<p style="color: white; font-size: 20px;">Нет данных на завтра</p>';
            return;
        }

        tomorrowList.forEach(item => {
            const time = item.dt_txt.split(' ')[1].slice(0, 5);
            const temp = Math.round(item.main.temp);
            const icon = item.weather[0].icon;
            const desc = item.weather[0].description;
            const rain = item.rain ? item.rain['3h'] || 0 : 0;
            const snow = item.snow ? item.snow['3h'] || 0 : 0;
            const precipitation = rain + snow;
            const precipText = precipitation > 0 ? `${precipitation.toFixed(1)} мм` : '0 мм';

            tomorrowCard.innerHTML += `
                <div class="forecast-item">
                    <p class="forecast-time">${time}</p>
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
                    <p class="forecast-temp">${temp}°C</p>
                    <p class="forecast-desc">${desc}</p>
                    <p class="forecast-precip">${precipText}</p>
                   
                </div>
            `;
        });

    } catch (error) {
        console.error('Ошибка прогноза на завтра:', error);
    }
}
//                      !!!!!!!!!!!!!!!!!!ПРОГНОЗ ПОГОДЫ НА НЕДЕЛЮЮЮ!!!!!!!!!!!!!!!!
async function checkWeekForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`);

        if (!response.ok) throw new Error('Город не найден');

        const data = await response.json();
        document.querySelector('.fourth').setAttribute('data-city', data.city.name);

        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const weekCard = document.querySelector('#week-forecast');
        weekCard.innerHTML = '';

        const dailyData = [];
        data.list.forEach(item => {
            const dateStr = item.dt_txt.split(' ')[0];
            const time = item.dt_txt.split(' ')[1];
            const index = dailyData.findIndex(i => i.dt_txt.startsWith(dateStr));

            if (index === -1) {
                dailyData.push(item);
            } else if (time === '12:00:00') {
                dailyData[index] = item;
            }
        });

        dailyData.forEach(item => {
            const date = new Date(item.dt_txt.split(' ')[0]);
            const dayShort = days[date.getDay()];
            const dayNum = String(date.getDate()).padStart(2, '0');
            const monthNum = String(date.getMonth() + 1).padStart(2, '0');
            const dateLabel = `${dayShort}, ${dayNum}.${monthNum}`;

            const temp = Math.round(item.main.temp);
            const icon = item.weather[0].icon;
            const desc = item.weather[0].description;

            const rain = item.rain ? item.rain['3h'] || 0 : 0;
            const snow = item.snow ? item.snow['3h'] || 0 : 0;
            const precip = rain + snow;
            const precipText = precip > 0 ? `${precip.toFixed(1)} мм` : '0 мм';

            weekCard.innerHTML += `
                <div class="week-item">
                    <p class="week-date">${dateLabel}</p>
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
                    <p class="week-temp">${temp}°C</p>
                    <p class="week-desc">${desc}</p>
                    <p class="week-precip">${precipText}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Ошибка прогноза на неделю:', error);
    }
}

checkWeather('Минск');