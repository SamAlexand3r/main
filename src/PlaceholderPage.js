import React, { useState, useEffect, useCallback } from 'react';
import './PlaceholderPage.css';
import logo from './img/logo.png'; // Логотип
import backgroundVideo from './img/background.webm'; // Видео-фон

const PlaceholderPage = () => {
  const [weather, setWeather] = useState({});
  const [currencyRates, setCurrencyRates] = useState({});
  const [amount, setAmount] = useState(1); // Количество для конвертации
  const [fromCurrency, setFromCurrency] = useState('EUR'); // Валюта из
  const [toCurrency, setToCurrency] = useState('USD'); // Валюта в
  const [convertedAmount, setConvertedAmount] = useState(null); // Результат конвертации
  const [flights, setFlights] = useState([]); // Данные о рейсах
  const [isArrivals, setIsArrivals] = useState(true); // Переключение между прилетами и вылетами
  const [showAllFlights, setShowAllFlights] = useState(false); // Для отображения всех рейсов
  const [bgGif, setBGGif] = useState(''); // Для GIF
  const [weatherIcon, setWeatherIcon] = useState(''); // Иконка погоды
  const [locationError, setLocationError] = useState('');

  const openWeatherApiKey = 'dea33256ba5e24c0a61b7a3ff8ed6d8f';
  const currencyApiKey = 'fca_live_VDzbPo5CpxlVl8Tc78C3eUD8abWhYBaSrr7T55B5';
  const aviationstackApiKey = '650f09af86f36ec0019e1f838586f7df';

  const currencyFlags = {
    EUR: '🇪🇺',
    USD: '🇺🇸',
    GBP: '🇬🇧',
    RUB: '🇷🇺',
    UAH: '🇺🇦',
    RSD: '🇷🇸',
  };

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
      setLocationError('Geolokacija nije podržана na vašем pretraživaču.');
    }
  }, []);

  // Получение данных о погоде
  const fetchWeather = (lat, lon) => {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${openWeatherApiKey}&lang=sr`;

    fetch(weatherUrl)
      .then(response => response.json())
      .then(data => {
        const main = data.weather[0].main;
        const temp = Math.round(data.main.temp);
        setWeather({
          condition: main,
          temperature: temp,
          city: data.name,
        });

        // Иконка погоды
        setWeatherIcon(`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);

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
        console.log("Ошибка при получении погоды:", error);
      });
  };

  // Мемоизация функции конвертации валют
  const convertCurrency = useCallback(() => {
    if (currencyRates && currencyRates[fromCurrency] && currencyRates[toCurrency]) {
      const converted = (amount / currencyRates[fromCurrency]) * currencyRates[toCurrency];
      setConvertedAmount(converted.toFixed(2));
    } else {
      console.log('Курсы валют не загружены.');
    }
  }, [amount, fromCurrency, toCurrency, currencyRates]);

  // Получение курсов валют
  const fetchCurrencyRates = useCallback(() => {
    const currencyUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${currencyApiKey}&currencies=USD,GBP,EUR,RUB,UAH,RSD`;

    fetch(currencyUrl)
      .then(response => response.json())
      .then(data => {
        setCurrencyRates(data.data);
      })
      .catch(error => {
        console.log("Ошибка при получении курсов валют:", error);
      });
  }, [currencyApiKey]);

  // Получение данных о рейсах
  const fetchFlights = useCallback(() => {
    const airportCode = 'TGD'; // Код аэропорта Подгорицы
    const flightType = isArrivals ? 'arr_iata' : 'dep_iata'; // Прилеты или вылеты
    const flightUrl = `https://api.aviationstack.com/v1/flights?access_key=${aviationstackApiKey}&${flightType}=${airportCode}`;

    fetch(flightUrl)
      .then(response => response.json())
      .then(data => {
        setFlights(data.data);
      })
      .catch(error => {
        console.log("Ошибка при получении данных о рейсах:", error);
      });
  }, [aviationstackApiKey, isArrivals]);

  useEffect(() => {
    getUserLocation(); // Вызов функции для получения местоположения
  }, [getUserLocation]);

  useEffect(() => {
    fetchCurrencyRates(); // Вызов функции для получения курсов валют
  }, [fetchCurrencyRates]);

  useEffect(() => {
    convertCurrency(); // Вызов функции конвертации валют
  }, [convertCurrency]);

  useEffect(() => {
    fetchFlights(); // Вызов функции для получения рейсов
  }, [fetchFlights]);

  // Функция для форматирования времени в "час:минуты"
  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="placeholder-page">
      {/* Видео-фон */}
      <video autoPlay muted loop className="background-video">
        <source src={backgroundVideo} type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Логотип */}
      <div className="logo-container">
        <img src={logo} alt="Monte-i.com" className="logo" />
      </div>

      {/* Блок с подписью */}
      <div className="signature-block">
        <p>Portal je u procesu razvoja, uskoro će ovde biti puno zanimljivih stvari!</p>
      </div>

      <div className="content-section">
        <div className="weather-section" style={{ backgroundImage: bgGif }}>
          <div className="weather-info">
            <h2>Vreme</h2>
            {locationError ? (
              <p>{locationError}</p>
            ) : (
              <div>
                <img src={weatherIcon} alt="Weather Icon" />
                <p>{weather.city}</p>
                <p>{weather.temperature ? `${weather.temperature}°C` : 'Učitavanje...'}</p>
                <p>{weather.condition}</p>
              </div>
            )}
          </div>
        </div>

        {/* Новый дизайн конвертера валют с динамическими флагами */}
        <div className="currency-section new-design">
          <div className="currency-block">
            <div className="currency-field">
              <span className="currency-flag">{currencyFlags[fromCurrency]}</span>
              <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="RUB">RUB</option>
                <option value="UAH">UAH</option>
                <option value="RSD">RSD</option>
              </select>
            </div>
            <input
              type="number"
              className="currency-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="currency-switch">
            <span>⇆</span>
          </div>

          <div className="currency-block">
            <div className="currency-field">
              <span className="currency-flag">{currencyFlags[toCurrency]}</span>
              <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="RUB">RUB</option>
                <option value="UAH">UAH</option>
                <option value="RSD">RSD</option>
              </select>
            </div>
            <input
              type="text"
              className="currency-output"
              value={convertedAmount || '0.00'}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Блок для отображения расписания рейсов */}
      <div className="schedule-section">
        <div className="flight-buttons">
          <button
            className={isArrivals ? 'active' : ''}
            onClick={() => setIsArrivals(true)}
          >
            Prileti
          </button>
          <button
            className={!isArrivals ? 'active' : ''}
            onClick={() => setIsArrivals(false)}
          >
            Odlazi
          </button>
        </div>

        <table className="flight-table">
          <thead>
            <tr>
              <th>Vreme</th>
              <th>Destinacija</th>
              <th>Let</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {flights.slice(0, showAllFlights ? flights.length : 5).map((flight, index) => (
              <tr key={index}>
                <td>{formatTime(flight.departure.scheduled || flight.arrival.scheduled)}</td>
                <td>{flight.departure.airport || flight.arrival.airport}</td>
                <td>{flight.flight.iata}</td>
                <td>{flight.flight_status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {flights.length > 5 && (
          <button onClick={() => setShowAllFlights(!showAllFlights)}>
            {showAllFlights ? 'Sakrij letove' : 'Prikaži sve letove'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaceholderPage;
