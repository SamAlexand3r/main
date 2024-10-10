import React, { useState, useEffect, useCallback } from 'react';
import './PlaceholderPage.css';
import logo from './img/logo.png'; // Логотип
import backgroundVideo from './img/background.mp4'; // Видео-фон

const PlaceholderPage = () => {
  const [weather, setWeather] = useState({});
  const [currencyRates, setCurrencyRates] = useState({});
  const [amount, setAmount] = useState(1); // Количество для конвертации
  const [fromCurrency, setFromCurrency] = useState('EUR'); // Валюта из
  const [toCurrency, setToCurrency] = useState('USD'); // Валюта в
  const [convertedAmount, setConvertedAmount] = useState(null); // Результат конвертации
  const [bgGif, setBGGif] = useState(''); // Для GIF
  const [locationError, setLocationError] = useState('');


  const openWeatherApiKey = 'dea33256ba5e24c0a61b7a3ff8ed6d8f';
  const currencyApiKey = 'fca_live_VDzbPo5CpxlVl8Tc78C3eUD8abWhYBaSrr7T55B5';

  
  // Мемоизация функции для получения местоположения
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude);
      }, () => {
        setLocationError('Nije moguće dobiti vašu lokaciju.');
      });
    } else {
      setLocationError('Geolokacija nije podržana na vašem pretraživaču.');
    }
  }, []);

  // Получение данных о погоде
  const fetchWeather = (lat, lon) => {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${openWeatherApiKey}&lang=sr`; // Устанавливаем параметр языка "sr" для сербского

    fetch(weatherUrl)
      .then(response => response.json())
      .then(data => {
        const main = data.weather[0].main;
        const temp = Math.round(data.main.temp); // Округляем температуру до целого числа
        setWeather({
          condition: main,
          temperature: temp,
          city: data.name, // Попробуем получить город на сербском
        });

        switch (main) {
          case "Snow":
            setBGGif("url('https://mdbgo.io/ascensus/mdb-advanced/img/snow.gif')");
            break;
          case "Clouds":
            setBGGif("url('https://mdbgo.io/ascensus/mdb-advanced/img/clouds.gif')");
            break;
          case "Fog":
            setBGGif("url('https://mdbgo.io/ascensus/mdb-advanced/img/fog.gif')");
            break;
          case "Rain":
            setBGGif("url('https://mdbgo.io/ascensus/mdb-advanced/img/rain.gif')");
            break;
          case "Clear":
            setBGGif("url('https://mdbgo.io/ascensus/mdb-advanced/img/clear.gif')");
            break;
          case "Thunderstorm":
            setBGGif("url('https://mdbgo.io/ascensus/mdb-advanced/img/thunderstorm.gif')");
            break;
          default:
            setBGGif("url('https://mdbgo.io/ascensus/mdb-advanced/img/clear.gif')");
            break;
        }
      })
      .catch(error => {
        console.log("Greška pri dobijanju vremenskih podataka:", error);
      });
  };

  // Мемоизация функции конвертации валют
  const convertCurrency = useCallback(() => {
    if (currencyRates[fromCurrency] && currencyRates[toCurrency]) {
      const converted = (amount / currencyRates[fromCurrency]) * currencyRates[toCurrency];
      setConvertedAmount(converted.toFixed(2));
    }
  }, [amount, fromCurrency, toCurrency, currencyRates]);

  // Получение курсов валют
  const fetchCurrencyRates = useCallback(() => {
    const currencyUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${currencyApiKey}&currencies=USD,GBP,EUR`;

    fetch(currencyUrl)
      .then(response => response.json())
      .then(data => {
        setCurrencyRates(data.data);
      })
      .catch(error => {
        console.log("Greška pri dobijanju podataka o kursu valuta:", error);
      });
  }, [currencyApiKey]);

  useEffect(() => {
    getUserLocation(); // Вызов функции
  }, [getUserLocation]); // Добавляем функцию в зависимости

  useEffect(() => {
    fetchCurrencyRates(); // Вызов функции для курсов валют
  }, [fetchCurrencyRates]); // Добавляем функцию в зависимости

  useEffect(() => {
    convertCurrency(); // Вызов функции
  }, [convertCurrency]); // Добавляем функцию в зависимости

  return (
    <div className="placeholder-page">
      {/* Видео-фон */}
      <video autoPlay muted loop className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Логотип */}
      <div className="logo-container">
        <img src={logo} alt="Monte-i.com" className="logo" />
      </div>

      {/* Блок с подписью */}
      <div className="signature-block">
        <p>Portal je u procesu razvoja, uskoro će ovde biti puno zanimljivih stvari!</p> {/* Обновленная надпись */}
      </div>

      <div className="content-section">
        <div className="weather-section" style={{ backgroundImage: bgGif }}>
          <div className="weather-info">
            <h2>Vreme</h2>
            {locationError ? (
              <p>{locationError}</p>
            ) : (
              <div>
                <p>{weather.city}</p>
                <p>{weather.temperature ? `${weather.temperature}°C` : 'Učitavanje...'}</p>
                <p>{weather.condition}</p>
              </div>
            )}
          </div>
        </div>

        <div className="currency-section">
          <div className="currency-info">
            <h2>Kalkulator valuta</h2>
            <div>
              <label>Iz:</label>
              <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>

              <label>U:</label>
              <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label>Količina:</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            {convertedAmount && (
              <div>
                <p>Rezultat: {convertedAmount} {toCurrency}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;