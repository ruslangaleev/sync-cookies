/*global chrome*/
import React from 'react';
import { TextField, Button, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { ACCESS_TOKEN, SERVER_ADDRESS, IS_ENABLE } from './constants/chromeStorageTypes';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '500px',
    height: '500px'
    // '& > * + *': {
    //   marginTop: theme.spacing(2),
    // },
  },
}));

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
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/token">Token</Link>
            </li>
            <li>
              <Link to="/server">Server</Link>
            </li>            
          </ul>
        </nav>

        <Switch>
          <Route path="/token">
            <Token />
          </Route>
          <Route path="/server">
            <Server />
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
      serverAddress: '',
      isEnable: false
    };
  }

  async componentDidMount() {
    const token = await getFromLocalStorageAsync(ACCESS_TOKEN);
    const server = await getFromLocalStorageAsync(SERVER_ADDRESS);
    const isEnable = await getFromLocalStorageAsync(IS_ENABLE);

    this.setState({
      accessToken: token,
      serverAddress: server,
      isEnable: isEnable
    });
  }

  async enableSync() {
    await setInLocalStorageAsync(IS_ENABLE, true);
    chrome.extension.getBackgroundPage().startup();
    this.setState({ isEnable: true });
  }

  async disableSync() {
    await setInLocalStorageAsync(IS_ENABLE, false);
    chrome.extension.getBackgroundPage().endup();
    this.setState({ isEnable: false });
  }

  EnableButton() {
    if (this.state.isEnable) {
      return(
        <Button variant="contained" onClick={() => this.disableSync()}>
          Выключить
        </Button>
      )
    } else {
      return (
        <Button variant="contained" color="primary" onClick={() => this.enableSync()}>
          Включить
        </Button>
      )
    }
  }

  render() {
    return (
      <div>
        Token: {this.state.accessToken}
        Server: {this.state.serverAddress}
        IsEnable: {this.state.isEnable}
        {this.EnableButton()}
      </div>
    );
  }
}

function Server() {
  const [server, setServer] = React.useState('');

  const changeServer = (event) => {
    setServer(event.target.value);
  };

  const saveServer = async () => {
    await setInLocalStorageAsync(SERVER_ADDRESS, server);
  };

  return(
    <div>
      <TextField id="outlined-basic" label="Адрес сервера" variant="outlined" onChange={changeServer} />
      <Button variant="contained" color="primary" onClick={saveServer}>
        Сохранить
      </Button>
    </div>
  );  
}

function Token() {
  const [token, setToken] = React.useState('');

  const changeToken = (event) => {
    setToken(event.target.value);
  };

  const saveToken = async () => {
    await setInLocalStorageAsync(ACCESS_TOKEN, token);
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
