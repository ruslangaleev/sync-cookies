

/*
	[] Проверка подтягивания куков с сервера
*/

chrome.cookies.onChanged.addListener(async (changeInfo) => {	
	//console.log('changeInfo1', changeInfo);

	const cookieName = changeInfo.cookie.name;
	const cookieValue = changeInfo.cookie.value;
	const cookieDomain = changeInfo.cookie.domain;
	const cookieInfoes = await getFromLocalStorageAsync(RESOURCE_URL);
	const even = (name) => cookieName == name;

	//console.log('cookieInfo2', cookieInfoes);

	const cookie = cookieInfoes.find(info => cookieDomain.indexOf(info.domain) > -1);

	//console.log('cookieInfo3', cookie);

	if (!cookie?.names?.some(even)) {
		return;
	}

	/*
		Куки обновлены/добавлен новый
	*/
	if (changeInfo.cause == 'explicit' && !changeInfo.removed) {
		const key = `sc_fromserver_${cookieDomain}_${cookieName}`;
		const existCookie = await getFromLocalStorageAsync(key);
		if (existCookie?.value == cookieValue) {
			// Обновление произошло со стороны сервера. Куки считаются актуальными
			return;
		} else {
			// Обновление произошло со стороны клиента. Необходимо отправить на сервер
			console.log(`Новый кук ${cookieName}` отправлен на сервер, changeInfo);
		}
	}

	/*
		Куки удалены
	*/
	if (changeInfo.cause == 'explicit' && changeInfo.removed) {
		const existCookie = await syncCookieClient.getCookies(cookieInfo.url, cookieName);
		await setCookie(existCookie);

		console.log(`С сервера обновлен кук ${cookieName}`, existCookie);
	}
});

// TODO: то что ниже перенести в другой файл
async function setCookie(cookieSource) {
	return await new Promise((resolve, reject) => {
		chrome.cookies.set({
			url: cookieSource.url,
			name: cookieSource.name,
			value: cookieSource.value,
			domain: cookieSource.domain
		}, (cookie) => {
			resolve(cookie);
		})
	});
}

const syncCookieClient = {
	getCookies: async (url, name) => {	  
	  const server = await getFromLocalStorageAsync(SERVER_URL);
	  
	  try {
		const response = await fetch(server + `/api/cookies?url=${url}&name=${name}`);
	    
	    // 401:
	    
	    if (response.status == 401) {      
	      return {
	        errorMessage: 'У клиента нет доступа'
	      };
	    }
	    
	    // 400:
	    
	    const content = await response.json();
	    
	    if (response.status == 400) {      
	      return {
	        errorMessage: content.errorMessage,
	        accessToken: content.access_token
	      };
	    }
	    
	    // 200:
	    
	    return content;
	  } catch (error) {
	  	return {
	    	errorMessage: 'Ошибка отправления запроса. Либо сервер недоступен, либо запрос составлен неверно'
	    };
	  }
	},
	updateCookie: async (url, name, value, domain) => {
	  const server = await getFromLocalStorageAsync(SERVER_URL);
	  
	  const cookieInfo = {
	    url: url,
	    name: name,
	    value: value,
	    domain: domain
	  }
	  
	  const dataRequest = {
	    method: 'POST',
	    headers: {
	      'Content-Type': 'application/json',
	      'Accept': 'application/json',
	      //'Authorization': 'Bearer ' + accessToken
	    },
	    body: JSON.stringify(cookieInfo)
	  };
	  
	  try {
		const response = await fetch(server + '/api/cookies', dataRequest);
	    
	    // 401:
	    
	    if (response.status == 401) {      
	      return {
	        errorMessage: 'У клиента нет доступа'
	      };
	    }
	    
	    // 400:
	    
	    const content = await response.json();
	    
	    if (response.status == 400) {      
	      return {
	        errorMessage: content.errorMessage,
	        accessToken: content.access_token
	      };
	    }
	    
	    // 200:
	    
	    return true;
	  } catch (error) {
	  	cookieStorageClientTimeId = setTimeout(updateCookies, 2000);
	  	return {
	    	errorMessage: 'Ошибка отправления запроса. Либо сервер недоступен, либо запрос составлен неверно'
	    };
	  }		
	}
}