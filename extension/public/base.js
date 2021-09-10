// yarn build

const ENV = "DEBUG";
//const ENV = "PROD";
//const ENV = "STAGE";

const IS_ENABLE_STORAGE = 'IS_ENABLE';
// генерируется
const COOKIE_INFOES_STORAGE = 'COOKIE_INFOES';
// генерируется
const UPDATE_FROM_SERVER_STORAGE = 'UPDATE_FROM_SERVER';
// генерируется
const UPDATE_COOKIE_TRACEID_STORAGE = 'UPDATE_COOKIE_TRACEID';
// Задается пользователем
const ACCESS_TOKEN_STORAGE = 'ACCESS_TOKEN';

const SERVER_ADDRESS = () => {
  if (ENV == "DEBUG") {
    // test
    return "http://cookiestorage.ru:8080";
  }

  // prod
  return "http://cookiestorage.ru";
}

const logger = {
  log: (message, obj) => {
    if (ENV != "DEBUG" && ENV != "STAGE") {
      return;
    }

    if (obj) {
      console.log(message, obj);
    } else {
      console.log(message);
    }
  },
  info: (message, obj) => {
    if (obj) {
      console.info(message, obj);
    } else {
      console.info(message);
    }
  },
  error: (message, obj) => {
    if (obj) {
      console.error(message, obj);
    } else {
      console.error(message);
    }
  },
  warn: (message, obj) => {
    if (obj) {
      console.warn(message, obj);
    } else {
      console.warn(message);
    }
  }
}

async function setCookie(cookieSource) {
	return await new Promise((resolve, reject) => {
		chrome.cookies.set({
			url: cookieSource.url,
			name: cookieSource.name,
			value: cookieSource.value,
			domain: cookieSource.domain,
			expirationDate: cookieSource.expirationDate
		}, (cookie) => {
			resolve(cookie);
		})
	});
}

async function getCookieAll(name, url) {
  return await new Promise((resolve, reject) => {
    chrome.cookies.getAll({"name": name, "url": url}, function(cookie) {
      resolve(cookie);
    });
  })
}

async function removeCookie(name, url) {
  return await new Promise((resolve, reject) => {
    chrome.cookies.remove({"name": name, "url": url});
  })
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

async function removeFromLocalStorageAsync(key) {
	return await new Promise((resolve, reject) => {
		chrome.storage.local.remove([key], (result) => {
			// resolve(result[key]);
		});		
	})
}

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}