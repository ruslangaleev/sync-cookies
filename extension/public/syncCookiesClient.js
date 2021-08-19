const syncCookieClient = {
	getCookies: async (traceId) => {
		const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN_STORAGE);

		const url = SERVER_ADDRESS() + `/api/cookies`;

		logger.log(`TraceId: ${traceId}. Get cookies. Url: ${url}`);
		try {
			const dataRequest = {
				method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'Authorization': 'Bearer ' + accessToken
					},
		  };
			logger.log(`Request: url: ${url}, data:`, dataRequest);
		  const response = await fetch(url, dataRequest);

		  if (response.status == 401) {
				logger.error('Server response status 401');
				return {
					isSuccess: false
				};
		  }
		  
		  const content = await response.json();
		  
		  if (response.status == 400) {
				logger.error('Server response status 400');
				return {
					isSuccess: false,
					errorMessage: content.errorMessage
				};
		  }
		  
		  if (response.status != 200) {
				logger.error(`Server response status ${response.status}`)
				return {
					isSuccess: false,
					errorMessage: content
				}
		  }

		  return {
				isSuccess: true,
			  content: content
		  };
		} catch (error) {
			logger.error('Request error by get cookies', error);
			return {
				isSuccess: false
			}
		}
	},
	updateCookie: async (cookieId, value, expirationDate, traceId) => {
	  const cookieInfo = {
	    value: value,
			expirationDate: expirationDate
	  }

	  const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN_STORAGE);
	  
	  const dataRequest = {
	    method: 'PUT',
	    headers: {
	      'Content-Type': 'application/json',
	      'Accept': 'application/json',
	      'Authorization': 'Bearer ' + accessToken
	    },
	    body: JSON.stringify(cookieInfo)
	  };
	  
		const url = `${SERVER_ADDRESS()}/api/cookies/${cookieId}`;

		logger.log(`TraceId: ${traceId} | Message: update cookie | Url: ${url} | dataContext:`, dataRequest);

	  try {
			const response = await fetch(url, dataRequest);
	    
		  if (response.status == 401) {
				logger.error(`TraceId ${traceId} | Message: Server response status 401`);
				return {
					isSuccess: false
				};
		  }
	    
	    const content = await response.json();
		
		  if (response.status == 400) {
				logger.error(`TraceId: ${traceId} | Message: Server response status 400 | ErrorMessage: ${content.errorMessage}`);
				return {
					isSuccess: false,
				};
		  }	
	    
		  if (response.status != 200) {
				logger.error(`TraceId: ${traceId} | Message: Server response status ${response.status}`)
				return {
					isSuccess: false,
					errorMessage: content
				}
		  }

		  return {
				isSuccess: true,
			  content: content
		  };
	  } catch (error) {
			logger.error(`TraceId: ${traceId} | Message: Request error by update cookie | Error:`, error);
			return {
				isSuccess: false
			}
	  }		
	},
	getCookie: async (cookieId, traceId) => {
	  const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN_STORAGE);

		const dataRequest = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + accessToken
			},
		};

		const url = `${SERVER_ADDRESS()}/api/cookies/${cookieId}`;

		logger.log(`TraceId: ${traceId} | Message: get cookie | Url: ${url} | DataRequest:`, dataRequest);

	  try {
			const response = await fetch(url, dataRequest);
	    
		  if (response.status == 401) {
				logger.error(`TraceId: ${traceId} | Message: server response status 401`);
				return {
					isSuccess: false
				};
		  }
	    
	    const content = await response.json();
		
		  if (response.status == 400) {
				logger.error(`TraceId: ${traceId} | Message: server response status 400`);
				return {
					isSuccess: false,
					errorMessage: content.errorMessage
				};
		  }	
	    
		  if (response.status != 200) {
				logger.error(`TraceId: ${traceId} | Message: server response status ${response.status}`)
				return {
					isSuccess: false,
					errorMessage: content
				}
		  }

		  return {
				isSuccess: true,
			  content: content
		  };
	  } catch (error) {
			logger.error(`TraceId ${traceId} | Message: request error by get cookie | Error:`, error);
			return {
				isSuccess: false
			}
	  }
	}	
}