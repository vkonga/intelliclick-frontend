import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';

import './index.css';

class Home extends Component {
  state = {
    citiesList: [],
    filteredCities: [],
    page: 1,
    loading: false,
    hasMore: true,
    searchTerm: '',
    filters: {
      name: '',
      country: '',
      timeZone: '',
      countryCode: '',
      population: ''
    },
    sort: {
      column: 'name',
      order: 'asc'
    },
    weatherData: {},
    errorMsg: ""
  };

  componentDidMount() {
    this.getCities();
    window.addEventListener('scroll', this.onChangeScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onChangeScroll);
  }

  getCities = async () => {
    if (this.state.loading || !this.state.hasMore) return;

    this.setState({ loading: true });
    const { page } = this.state;
    const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?limit=20&offset=${(page - 1) * 20}`;
    const options = { method: "GET" };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (response.ok) {
        const addNewCities = data.results.map(each => ({
          name: each.name,
          country: each.cou_name_en,
          timeZone: each.timezone,
          population: each.population,
          countryCode: each.country_code
        }));

        // Fetch weather data for new cities and update state accordingly
        this.fetchWeatherData(addNewCities).then(() => {
          this.setState(prevState => ({
            citiesList: [...prevState.citiesList, ...addNewCities],
            filteredCities: this.applyFilters([...prevState.citiesList, ...addNewCities]),
            page: prevState.page + 1,
            hasMore: data.results.length > 0,
            loading: false,
            errorMsg: ""
          }));
        });

      }
    } catch (error) {
      this.setState({ loading: false, errorMsg: "Page Not Found. Try again and check fetching URL." });
    }
  };

  fetchWeatherData = async (cities) => {
    const apiKey = '669971031d686e6634103c148c50a257';
    const weatherData = { ...this.state.weatherData };

    // Fetch weather data for each city and update the state
    await Promise.all(cities.map(async (city) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.name)}&units=metric&appid=${apiKey}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
          weatherData[city.name] = {
            temp: data.main.temp,
            tempHigh: data.main.temp_max,
            tempLow: data.main.temp_min
          };
        }
      } catch (error) {
        console.log("Error fetching weather data");
      }
    }));

    this.setState({ weatherData });
  };

  onChangeScroll = () => {
    const { innerHeight } = window;
    const { scrollHeight, scrollTop } = document.documentElement;

    if (scrollTop + innerHeight >= scrollHeight - 5 && !this.state.loading) {
      this.getCities();
    }
  };

  onChangeSearch = (event, { newValue }) => {
    this.setState({
      searchTerm: newValue,
      filters: {
        ...this.state.filters,
        name: newValue,
        country: newValue
      }
    }, this.applyFiltersAndSort);
  };

  onSuggestionsFetchRequested = ({ value }) => {
    const filteredCities = this.applyFilters(this.state.citiesList).filter(city =>
      city.name.toLowerCase().includes(value.toLowerCase()) ||
      city.country.toLowerCase().includes(value.toLowerCase())
    );
    this.setState({ filteredCities });
  };

  onSuggestionsClearRequested = () => {
    this.setState({ filteredCities: [] });
  };

  getSuggestionValue = suggestion => suggestion.name;

  renderSuggestion = suggestion => (
    <div>
      {suggestion.name} ({suggestion.country})
    </div>
  );

  applyFilters = (cities) => {
    const { filters } = this.state;
    return cities.filter(city =>
      city.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      city.country.toLowerCase().includes(filters.country.toLowerCase())
    );
  };

  applyFiltersAndSort = () => {
    let filteredCities = this.applyFilters(this.state.citiesList);
    filteredCities = this.sortCities(filteredCities);
    this.setState({ filteredCities });
  };

  sortCities = (cities) => {
    const { column, order } = this.state.sort;
    return cities.sort((a, b) => {
      if (a[column] < b[column]) return order === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  handleFilterChange = (column) => (event) => {
    this.setState({
      filters: {
        ...this.state.filters,
        [column]: event.target.value
      }
    }, this.applyFiltersAndSort);
  };

  handleSortChange = (column) => () => {
    this.setState(prevState => ({
      sort: {
        column,
        order: prevState.sort.column === column && prevState.sort.order === 'asc' ? 'desc' : 'asc'
      }
    }), this.applyFiltersAndSort);
  };

  render() {
    const { filteredCities, searchTerm, filters, sort, weatherData, loading, errorMsg } = this.state;
    const inputProps = {
      placeholder: 'Search cities or countries...',
      value: searchTerm,
      onChange: this.onChangeSearch
    };

    return (
      <div className="container">
        <h1>Cities Table</h1>
        <div className="search-container">
          <Autosuggest
            suggestions={filteredCities}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={this.renderSuggestion}
            inputProps={inputProps}
          />
        </div>
        <div className="table-container">
          <table className="cities-table">
            <thead>
              <tr>
                <th>
                  <button onClick={this.handleSortChange('name')}>City Name {sort.column === 'name' && (sort.order === 'asc' ? '↑' : '↓')}</button>
                  <input
                    type="text"
                    placeholder="Filter by city"
                    value={filters.name}
                    onChange={this.handleFilterChange('name')}
                  />
                </th>
                <th>
                  <button onClick={this.handleSortChange('country')}>Country {sort.column === 'country' && (sort.order === 'asc' ? '↑' : '↓')}</button>
                  <input
                    type="text"
                    placeholder="Filter by country"
                    value={filters.country}
                    onChange={this.handleFilterChange('country')}
                  />
                </th>
                <th>
                  <button onClick={this.handleSortChange('timeZone')}>Timezone {sort.column === 'timeZone' && (sort.order === 'asc' ? '↑' : '↓')}</button>
                  <input
                    type="text"
                    placeholder="Filter by timezone"
                    value={filters.timeZone}
                    onChange={this.handleFilterChange('timeZone')}
                  />
                </th>
                <th>
                  <button onClick={this.handleSortChange('countryCode')}>Country Code {sort.column === 'countryCode' && (sort.order === 'asc' ? '↑' : '↓')}</button>
                  <input
                    type="text"
                    placeholder="Filter by code"
                    value={filters.countryCode}
                    onChange={this.handleFilterChange('countryCode')}
                  />
                </th>
                <th>
                  <button onClick={this.handleSortChange('population')}>Population {sort.column === 'population' && (sort.order === 'asc' ? '↑' : '↓')}</button>
                  <input
                    type="text"
                    placeholder="Filter by population"
                    value={filters.population}
                    onChange={this.handleFilterChange('population')}
                  />
                </th>
                <th>Temperature</th>
              </tr>
            </thead>
            <tbody>
              {filteredCities.map((city, index) => (
                <tr key={index}>
                  <td data-label="City Name">
                  <a href={`/weather/${encodeURIComponent(city.name)}`} target="_blank" rel="noopener noreferrer">
                      {city.name}
                    </a>
                    
                  </td>
                  <td data-label="Country">{city.country}</td>
                  <td data-label="Timezone">{city.timeZone}</td>
                  <td data-label="Country Code">{city.countryCode}</td>
                  <td data-label="Population">{city.population}</td>
                  <td data-label="Temperature">
                    {weatherData[city.name] ? (
                      <>
                        <div>Temp: {weatherData[city.name].temp}°C</div>
                        <div>High: {weatherData[city.name].tempHigh}°C</div>
                        <div>Low: {weatherData[city.name].tempLow}°C</div>
                      </>
                    ) : 'Loading...'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="spinner">Loading...</div>}
        {errorMsg && <p className="error">{errorMsg}</p>}
      </div>
    );
  }
}

export default Home;
