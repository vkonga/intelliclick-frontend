import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import WeatherPage from './components/WeatherPage';

const App = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/weather/:city" component={WeatherPage} />
    </Switch>
  </Router>
);

export default App;
