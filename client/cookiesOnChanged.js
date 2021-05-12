

/*
	[] Проверка подтягивания куков с сервера
*/

chrome.cookies.onChanged.addListener(async (changeInfo) => {	
	console.log('changeInfo', changeInfo);

	const cookieName = changeInfo.cookie.name;
	const cookieValue = changeInfo.cookie.value;
	const cookieDomain = changeInfo.cookie.domain;
	const cookieInfoes = await getFromLocalStorageAsync(COOKIE_INFOES);
	const even = (name) => cookieName == name;

	// TODO: каждую информацию о куке хранить отдельно в storage, чтобы не проходиться по списку

	console.log('cookieInfo', cookieInfoes);

	const cookie = cookieInfoes.find(info => cookieDomain.indexOf(info.domain) > -1);

	console.log('Найденные куки', cookie);

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
			const cookieInfoes = await getFromLocalStorageAsync(COOKIE_INFOES);
			await syncCookieClient.updateCookie(cookie.url, cookieName, cookieValue, cookieDomain);
			console.log(`Новый кук ${cookieName} отправлен на сервер`, changeInfo);
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
	  	const dataRequest = {
	  		method: 'GET',
		    headers: {
		      'Content-Type': 'application/json',
		      'Accept': 'application/json',
		      'Authorization': 'Bearer ' + TEST_TOKEN
		    },
		};

		const response = await fetch(server + `/api/cookies?url=${url}&name=${name}`, dataRequest);
	    
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
	      'Authorization': 'Bearer ' + TEST_TOKEN
	    },
	    body: JSON.stringify(cookieInfo)
	  };
	  
	  try {
		const response = await fetch(server + '/api/cookies', dataRequest);
	    
		console.log('Ответ сервера RESPONSE', response);
		console.log('Ответ сервера JSON', await response.json());

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