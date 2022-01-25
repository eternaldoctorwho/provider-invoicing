import * as React from 'react';
//import './App.css';
import DivPortal from './DivPortal'
import Invoice from "./Invoice/Invoice"
import RatingDetails from "./RatingDetails";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import "../style/main.css"
import "../style/tailwind.css"
import "../style/fontawesome.css"

const App: React.FC = () => {
  return (
    <DivPortal>
      <Router basename="/p">
        <Switch>
          <Route exact path="/">
            <div></div>
          </Route>
          <Route path="/invoice/:jobId" component={Invoice} />
          <Route path="/rating" component={RatingDetails} />
        </Switch>
      </Router>
    </DivPortal>
  )
}

const Temp: React.FC = () => {
    return <App />
}

export default App;
