/*global chrome*/
import React from 'react';
import { TextField, Button, Snackbar, Typography, Hidden  } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { ACCESS_TOKEN_STORAGE, IS_ENABLE_STORAGE } from './base';
import './App.css';

async function setInLocalStorageAsync(key, value) {
	return await new Promise((resolve, reject) => {
		chrome.storage.local.set({[key]: value}, () => {
			resolve(true);
		});		
	})
}

async function getFromLocalStorageAsync(key) {
	return await new Promise((resolve, reject) => {
		chrome.storage.local.get([key], (result) => {
			resolve(result[key]);
		});		
	})
}

function App() {
  return (
    <Router>
      <div className="app">
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/token">Token</Link>
            </li>            
          </ul>
        </nav>

        <Switch>
          <Route path="/token">
            <Token />
          </Route>         
          <Route path="/">
            <Home />
          </Route>                       
        </Switch>
      </div>
    </Router>
  );
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: '',
      isEnable: false
    };
  }

  async componentDidMount() {
    const token = await getFromLocalStorageAsync(ACCESS_TOKEN_STORAGE);
    const isEnable = await getFromLocalStorageAsync(IS_ENABLE_STORAGE);

    this.setState({
      accessToken: token,
      isEnable: isEnable
    });
  }

  async enableSync() {
    await setInLocalStorageAsync(IS_ENABLE_STORAGE, true);
    await chrome.extension.getBackgroundPage().main();
    this.setState({ isEnable: true });
  }

  async disableSync() {
    await setInLocalStorageAsync(IS_ENABLE_STORAGE, false);
    await chrome.extension.getBackgroundPage().stop();
    this.setState({ isEnable: false });
  }

  EnableButton() {
    if (this.state.isEnable) {
      return(
        <Button variant="contained" onClick={() => this.disableSync()}>
          Disable
        </Button>
      )
    } else {
      return (
        <Button variant="contained" color="primary" onClick={() => this.enableSync()}>
          Enable
        </Button>
      )
    }
  }

  render() {
    return (
      <div>
        <h2>Auth token:</h2>
        <div>
          <div className='token'>
            {this.state.accessToken}
          </div>
          <Button variant="contained" onClick={() => this.props.history.push("/token")}>
            Edit
          </Button>
        </div>

        <h2>Status:</h2>
        {this.state.isEnable}

        {this.EnableButton()}
      </div>
    );
  }
}

function Token() {
  const [token, setToken] = React.useState('');

  const changeToken = (event) => {
    setToken(event.target.value);
  };

  const saveToken = async () => {
    await setInLocalStorageAsync(ACCESS_TOKEN_STORAGE, token);
  };

  return(
    <div>
      <TextField id="outlined-basic" label="Токен авторизации" variant="outlined" onChange={changeToken} />
      <Button variant="contained" color="primary" onClick={saveToken}>
        Сохранить
      </Button>
    </div>
  );
}

export default App;
