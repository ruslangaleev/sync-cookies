/*global chrome*/
import React from 'react';
import { TextField, Button, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

const ACCESS_TOKEN = 'sc_access_token';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '500px',
    height: '500px'
    // '& > * + *': {
    //   marginTop: theme.spacing(2),
    // },
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [token, setToken] = React.useState('');

  const handleClick = async () => {
    await setInLocalStorageAsync(ACCESS_TOKEN, token);
    setOpen(true);
  };

  const handleChange = (event) => {
    setToken(event.target.value);
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          Токен успешно сохранен
        </Alert>
      </Snackbar>

      <TextField label="Токен авторизации" variant="outlined" onChange={handleChange} />
      {/* TODO: Что такое contained? */}
      <Button variant="contained" color="primary" onClick={handleClick}>
        Сохранить
      </Button>


    </div>        
  );
}

export default App;
