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

const ACCESS_TOKEN = 'sc_access_token';
const RESOURCE_INFOES = 'sc_resource_infoes';

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
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
            <li>
              <Link to="/token">Token</Link>
            </li>                  
            <li>
              <Link to="/resources/new">NewResource</Link>
            </li>             
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/users">
            <Users />
          </Route>
          <Route path="/token">
            <Token />
          </Route>
          <Route path="/resources/new">
            <ResourceDetails />
          </Route>
          <Route path="/resources/:url">
            <ResourceDetails />
          </Route>          
          <Route path="/">
            <Home />
          </Route>                       
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  const [token, setToken] = React.useState('');
  const [resourceInfoes, setResourceInfoes] = React.useState('');

  const refreshData = async () => {
    const token = await getFromLocalStorageAsync(ACCESS_TOKEN);
    setToken(token);

    const resourceInfoes = await getFromLocalStorageAsync(RESOURCE_INFOES);
    setResourceInfoes(JSON.stringify(resourceInfoes));
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={refreshData}>
        Обновить
      </Button>
      Token: {token}
      ResourceInfoes: {resourceInfoes}
      <nav>
        <ul>
          {resourceInfoes?.map(item => {
            <li>
              <Link to="/resources/:url">{item.url}</Link>
            </li>
          })}
        </ul>
      </nav>      
    </div>
  );
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
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
        Добавить токен
      </Button>
    </div>
  );
}

function ResourceDetails() {
  const [addressResource, setAddressResource] = React.useState('');
  const [domainResource, setDomainResource] = React.useState('');

  const changeAddressResource = (event) => {
    setAddressResource(event.target.value);
  };

  const changeDomainResource = (event) => {
    setDomainResource(event.target.value);
  };

  const saveResource = async () => {
    let resourceInfoes = await getFromLocalStorageAsync(RESOURCE_INFOES);
    if (!resourceInfoes) {
      resourceInfoes = [ {
        url: addressResource,
        domain: domainResource,
        names: []
      } ];
    } else {
      resourceInfoes.push({
        url: addressResource,
        domain: domainResource,
        names: []
      });
    }

    await setInLocalStorageAsync(RESOURCE_INFOES, resourceInfoes);
  };

  return(
    <div>
      <TextField id="outlined-basic" label="Адрес источника" variant="outlined" onChange={changeAddressResource} />
      <TextField id="outlined-basic" label="Домен источника" variant="outlined" onChange={changeDomainResource} />
      <Button variant="contained" color="primary" onClick={saveResource}>
        Добавить источник
      </Button>
    </div>
  );
}

export default App;
