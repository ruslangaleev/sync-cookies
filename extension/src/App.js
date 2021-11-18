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

const divStyle = {
  paddingBottom: 10
}

function App() {
  return (<Home />);
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: '',
      isEnable: false,
    };
  }

  async componentDidMount() {
    var token = await getFromLocalStorageAsync(ACCESS_TOKEN_STORAGE);
    const isEnable = await getFromLocalStorageAsync(IS_ENABLE_STORAGE);

    if (!token) {
      token = "Токен не установлен";
    }

    this.setState({
      accessToken: token,
      isEnable: isEnable,
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

  // Авторизоваться
  async logIn() {
    await chrome.extension.getBackgroundPage().initializeAllCookies();
  }

  // Авторизовать
  async authorize() {

  }

  async saveToken () {
    await setInLocalStorageAsync(ACCESS_TOKEN_STORAGE, this.state.accessToken);
  }; 
  
  changeToken = (event) => {
    this.setState({ accessToken: event.target.value });
  };  

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
        <div>
          <TextField id="outlined-basic" label="Токен авторизации" variant="outlined" onChange={this.changeToken} style={divStyle} />
          <Button variant="contained" onClick={() => this.saveToken()}>
            Записать токен в Storage
          </Button>
        </div>        
        <h2>Auth token:</h2>
        <div>
          <div className='token'>
            <div style={divStyle}>
              <div style={{overflow: "hidden", textOverflow: "ellipsis", width: '11rem'}}>
                {this.state.accessToken}
              </div>
            </div>
          </div>
        </div>

        <div style={divStyle}>
          <Button variant="contained" color="primary" onClick={() => this.logIn()}>
            Авторизоваться
          </Button>
        </div>
        <div style={divStyle}>
          <Button variant="contained" onClick={() => this.authorize()}>
            Авторизовать
          </Button>
        </div>
        <div>
          {this.EnableButton()}
        </div>
      </div>
    );
  }
}

export default App;
