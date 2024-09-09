import React, { Component } from 'react';
import './index.css';

class WeatherPage extends Component {
  state = {
    weather: null,
    error: null,
    notFound: false
  };

  componentDidMount() {
    this.fetchWeatherData();
  }

  fetchWeatherData = async () => {
    const { city } = this.props.match.params;
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=669971031d686e6634103c148c50a257`);
      
      if (response.status === 404) {
        this.setState({ notFound: true, error: 'City not found' });
        return;
      }

      if (!response.ok) {
        throw new Error('Error fetching weather data');
      }

      const data = await response.json();
      this.setState({ weather: data, notFound: false, error: null });
    } catch (error) {
      this.setState({ error: error.message, notFound: false });
    }
  };

  render() {
    const { weather, error } = this.state;

    return (
      <div className="weather-container">
        <h1 className="weather-heading">Weather Information</h1>
        {error && <p className="error-message">{error}</p>}
        {weather ? (
          <div className="weather-info">
            <div className="weather-detail">
              <h2>City</h2>
              <p>{weather.name}</p>
            </div>
            <div className="weather-detail">
              <h2>Temperature</h2>
              <p>{Math.round(weather.main.temp - 273.15)}°C</p>
            </div>
            <div className="weather-detail">
              <h2>Min Temperature</h2>
              <p>{Math.round(weather.main.temp_min - 273.15)}°C</p>
            </div>
            <div className="weather-detail">
              <h2>Max Temperature</h2>
              <p>{Math.round(weather.main.temp_max - 273.15)}°C</p>
            </div>
            <div className="weather-detail">
              <h2>Weather</h2>
              <p>{weather.weather[0].description}</p>
              <img src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`} alt={weather.weather[0].description} />
            </div>
            <div className="weather-detail">
              <h2>Humidity</h2>
              <p>{weather.main.humidity}%</p>
            </div>
            <div className="weather-detail">
              <h2>Wind Speed</h2>
              <p>{weather.wind.speed} m/s</p>
            </div>
            <div className="weather-detail">
              <h2>Pressure</h2>
              <p>{weather.main.pressure} hPa</p>
            </div>
            <div className="weather-detail">
              <h2>Visibility</h2>
              <p>{weather.visibility / 1000} km</p>
            </div>
            <div className="weather-detail">
              <h2>Coordinates</h2>
              <p>Longitude: {weather.coord.lon}</p>
              <p>Latitude: {weather.coord.lat}</p>
            </div>
            <div className="weather-detail">
              <h2>Sunrise</h2>
              <p>{new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
            </div>
            <div className="weather-detail">
              <h2>Sunset</h2>
              <p>{new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
            </div>
          </div>
        ) : (
          !error && <p className="loading-message">Loading weather data...</p>
        )}
      </div>
    );
  }
}

export default WeatherPage;
