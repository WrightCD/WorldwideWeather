import React, { useState, useEffect } from "react";
import Search from "./Search";
import axios from "axios";
import Flag from "./Flag";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [searchCity, setSearchCity] = useState(null);
  const [cityImage, setCityImage] = useState(
    "https://images.unsplash.com/photo-1544766230-594734c916df?crop=entropy\u0026cs=srgb\u0026fm=jpg\u0026ixid=M3w1MzUxNjl8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MjEwOTk1ODh8\u0026ixlib=rb-4.0.3\u0026q=85"
  );
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing Current Location Data.");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
        );
        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
        );
        const nextSixDays = forecastResponse.data.list.filter(
          (item, index) => index % 8 === 0
        );
        setForecastData(nextSixDays);
        setWeatherData(response.data);
        fetchQuote();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    if (searchCity) {
      fetchData();
    }
  }, [searchCity]);

  useEffect(() => {
    const getCityFromCoordinates = async (latitude, longitude) => {
      try {
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.REACT_APP_OPENCAGE_API_KEY}`
        );
        const city = response.data.results[0].components.city || "Toronto";
        setSearchCity(city);
        fetchCityImage(city);
        fetchQuote();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching city from coordinates:", error);
        setSearchCity("Toronto");
        fetchCityImage("Toronto");
        setLoading(false);
      }
    };

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            getCityFromCoordinates(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
            setSearchCity("Toronto");
            fetchCityImage("Toronto");
            setLoading(false);
          }
        );
      } else {
        setSearchCity("Toronto");
        fetchCityImage("Toronto");
        setLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  useEffect(() => {
    let loadingInterval;
    if (loading) {
      loadingInterval = setInterval(() => {
        setLoadingMessage((prev) => {
          switch (prev) {
            case "Analyzing Current Location Data.":
              return "Analyzing Current Location Data..";
            case "Analyzing Current Location Data..":
              return "Analyzing Current Location Data...";
            default:
              return "Analyzing Current Location Data.";
          }
        });
      }, 500);
    }
    return () => {
      clearInterval(loadingInterval);
    };
  }, [loading]);

  const fetchCityImage = async (city) => {
    try {
      const response = await axios.get(
        `https://api.unsplash.com/photos/random?query=${city}&client_id=${process.env.REACT_APP_UNSPLASH_API_KEY}`
      );
      setCityImage(response.data.urls.regular);
    } catch (error) {
      console.error("Error fetching city image:", error);
    }
  };

  const fetchQuote = async () => {
    try {
      const response = await axios.get(`https://api.quotable.io/random`);
      setQuote(response.data);
    } catch (error) {
      console.error("Error getting quote:", error);
    }
  };

  const handleSearch = (city) => {
    setSearchCity(city);
    fetchCityImage(city);
    fetchQuote();
  };

  const convertKelvin = (kelvin) => {
    var celTemp = kelvin - 273.15;
    return celTemp.toFixed(1);
  };

  const dayOfWeek = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { weekday: "long" };
    return date.toLocaleDateString("en-US", options);
  };

  const dayOfWeekShort = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { weekday: "short" };
    return date.toLocaleDateString("en-US", options);
  };

  const getCurrentDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div id="fullapp">
      <div id="weatherbox">
        <div id="leftbox">
          {weatherData && (
            <div id="basicinfo">
              <p>{dayOfWeek(weatherData.dt)}</p>
              <p>{getCurrentDate(weatherData.dt)}</p>
              <p>{weatherData.name}</p>
              <p>
                <img
                  src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
                  alt="Weather icon"
                />
              </p>
              <p>{convertKelvin(weatherData.main.temp)}°C</p>
              <p>{weatherData.weather[0].main}</p>
            </div>
          )}
          <div>
            {weatherData && <Flag countryCode={weatherData.sys.country} />}
          </div>
        </div>
        <div id="rightbox">
          <div id="mainright">
            {loading && (
              <div id="loading-message">
                <p>{loadingMessage}</p>
                <p>Please wait or enter a city name.</p>
              </div>
            )}
            {weatherData && (
              <div id="stats">
                <p>Humidity: {weatherData.main.humidity}%</p>
                <p>Wind: {weatherData.wind.speed} km/h</p>
                <p>Air Pressure: {weatherData.main.pressure} mb</p>
                <p>Max Temp: {convertKelvin(weatherData.main.temp_max)}°C</p>
                <p>Min Temp: {convertKelvin(weatherData.main.temp_min)}°C</p>
              </div>
            )}
            <div id="search">
              <Search onSearch={handleSearch} />
            </div>
          </div>
          {quote && (
            <div id="quote">
              <p>"{quote.content}"</p>
              <p>- {quote.author}</p>
            </div>
          )}
        </div>
        <div
          id="midbox"
          style={{
            backgroundImage: `url(${cityImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100%",
            height: "100%",
          }}
        ></div>
      </div>
      <div className="forecast-container">
        {forecastData.slice(0).map((forecast, index) => (
          <div key={index} className="forecast-box">
            <p>{dayOfWeekShort(forecast.dt)}</p>
            <img
              src={`https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`}
              alt={forecast.weather[0].description}
            />
            <p>{convertKelvin(forecast.main.temp)}°C</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Weather;
