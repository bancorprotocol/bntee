import AppLandingContainer from './components/landing/AppLandingContainer'
import AppAdmin from './components/admin/AppAdmin'
import '@formatjs/intl-numberformat/polyfill'
import '@formatjs/intl-numberformat/locale-data/en' // locale-data for en

import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

function App() {
  return (
    <Router>
    <div className="App">
      <Switch>
        <Route exact path="/">
          <AppLandingContainer />
        </Route>
        <Route path="/admin">
          <AppAdmin />
        </Route>
      </Switch>  
    </div>
    </Router>
  );
}

export default App;
