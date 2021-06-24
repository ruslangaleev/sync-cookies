const syncCookieClient = {
	getCookie: async (cookieId) => {
	  const PRE = `SYNC COOKIE CLIENT | GET COOKIE BY ${cookieId}`;

	  const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN);

	  try {
	  	const dataRequest = {
	  		method: 'GET',
		    headers: {
		      'Content-Type': 'application/json',
		      'Accept': 'application/json',
		      'Authorization': 'Bearer ' + accessToken
		    },
		};

		const response = await fetch(SERVER_ADDRESS + `/api/cookies/${cookieId}`, dataRequest);
	    
	    // 401:
	    
	    if (response.status == 401) {      
	      return {
	        errorMessage: 'У клиента нет доступа'
	      };
	    }
	    
	    // 400:
	    
	    const content = await response.json();
		console.log(`${PRE} | CONTENT JSON`, content);
	    
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
	getCookies: async () => {
		const PRE = `syncCookieClient > getCookies`;

		console.log(`${PRE} try get cookies`);

		const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN);
		try {
			const dataRequest = {
				method: 'GET',
			  headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + accessToken
			  },
		  };
  
		  const response = await fetch(SERVER_ADDRESS + `/api/cookies`, dataRequest);

		  if (response.status == 401) {
			return {
				status: response.status,
				errorMessage: 'Пользователь не авторизован'
			};
		  }
		  
		  const content = await response.json();
		  
		  if (response.status == 400) {
			return {
				status: response.status,
				errorMessage: content.errorMessage
			};
		  }
		  
		  if (response.status != 200) {
			return {
				status: response.status,
				errorMessage: content
			}
		  }

		  return {
			status: 200,
			content: content
		  };
		} catch (error) {
			return {
				status: 500
			}
		}
	},
	updateCookie: async (cookieId, value, expirationDate) => {	  
	  const PRE = `syncCookieClient > updateCookie`;

	  const cookieInfo = {
	    value: value,
		expirationDate: expirationDate
	  }

	  console.log(`${PRE} > try send, cookieId: ${cookieId}, value: ${value}`);

	  const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN);
	  
	  const dataRequest = {
	    method: 'PUT',
		mode: 'no-cors',
	    headers: {
	      'Content-Type': 'application/json',
	      'Accept': 'application/json',
	      'Authorization': 'Bearer ' + accessToken
	    },
	    body: JSON.stringify(cookieInfo)
	  };
	  
	  try {
		const response = await fetch(SERVER_ADDRESS + `/api/cookies/${cookieId}`, dataRequest);
	    
		if (response.status == 401) {
			return {
				status: response.status,
				errorMessage: 'Пользователь не авторизован'
			};
		}
	    
	    const content = await response.json();
		
		if (response.status == 400) {
			return {
				status: response.status,
				errorMessage: content.errorMessage
			};
		}		
	    
		if (response.status != 200) {
			return {
				status: response.status,
				errorMessage: content
			}
		  }

		  return {
			status: 200
		  };
	  } catch (error) {
		return {
			status: 500
		}
	  }		
	}
}