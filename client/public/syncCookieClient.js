const syncCookieClient = {
	getCookie: async (cookieId) => {	  
	  const server = await getFromLocalStorageAsync(SERVER_ADDRESS);
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

		const response = await fetch(server + `/api/cookies?cookieId=${cookieId}`, dataRequest);
	    
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
	getCookies: async () => {
		const PRE = `SYNC COOKIE CLIENT | GET COOKIES`;

		console.log(`${PRE} | START`);
		const server = await getFromLocalStorageAsync(SERVER_ADDRESS);
		console.log(`${PRE} | SERVER`, server);

		const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN);
		console.log(`${PRE} | ACCESS TOKEN`, accessToken);
		try {
			const dataRequest = {
				method: 'GET',
			  headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + accessToken
			  },
		  };
  
		  const response = await fetch(server + `/api/cookies`, dataRequest);
		  
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
	updateCookie: async (cookieId, value) => {
	  const server = await getFromLocalStorageAsync(SERVER_ADDRESS);
	  
	  const cookieInfo = {
	    cookieId: cookieId,
	    value: value
	  }

	  console.log(`TRY SEND | COOKIEID: ${cookieId} | VALUE: ${value}`);

	  const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN);
	  
	  const dataRequest = {
	    method: 'POST',
	    headers: {
	      'Content-Type': 'application/json',
	      'Accept': 'application/json',
	      'Authorization': 'Bearer ' + accessToken
	    },
	    body: JSON.stringify(cookieInfo)
	  };
	  
	  try {
		const response = await fetch(server + '/api/cookies', dataRequest);
	    
		console.log(`RESPONSE | STATUS: ${response.status}`);

	    // 401:
	    
	    if (response.status == 401) {      
	      return {
	        errorMessage: 'У клиента нет доступа'
	      };
	    }
	    
	    // 400:
	    
	    const content = await response.json();
		console.log(`RESPONSE CONTENT | CONTENT: ${content}`);
	    
	    if (response.status == 400) {      
	      return {
	        errorMessage: content.errorMessage,
	        accessToken: content.access_token
	      };
	    }
	    
	    // 200:

		console.log(`SENT | COOKIEID: ${cookieId} | VALUE: ${value}`);
	    
	    return true;
	  } catch (error) {
	  	setTimeout(() => { syncCookieClient.updateCookie(cookieId, value) }, 5000); // TODO: изменить на 2000
	  	// return {
	    // 	errorMessage: 'Ошибка отправления запроса. Либо сервер недоступен, либо запрос составлен неверно'
	    // };
		console.log(`ERROR SEND | ERROR: ${error}`);
	  }		
	}
}