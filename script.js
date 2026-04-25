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
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

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
        windElement.textContent = `${Math.round(data.wind.speed * 3.6)} км/ч`;

        const rain = data.rain ? data.rain['1h'] || data.rain['3h'] || 0 : 0;
        const snow = data.snow ? data.snow['1h'] || data.snow['3h'] || 0 : 0;
        const precipitation = rain + snow;
        precipitationElement.textContent = `${precipitation > 0 ? precipitation.toFixed(1) : 0} мм`;

        const iconCode = data.weather[0].icon;
        const description = data.weather[0].description;

        updateWeatherImage(iconCode, description);

        errorElement.style.display = 'none';
        weatherElement.style.display = 'block';

    } catch (error) {
        errorElement.style.display = 'block';
        weatherElement.style.display = 'none';
    }
}

function updateWeatherImage(iconCode, description) {
    weatherImage.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="${description}">
        <p class="weather-desc">${description}</p>
    `;
}

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
        checkWeather(searchInput.value.trim());
    }
});

checkWeather('Минск');