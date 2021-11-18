const v2syncCookieClient = {
	getCookies: async (traceId) => {
		const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN_STORAGE);

		const url = SERVER_ADDRESS() + `/api/v2/cookies`;

		logger.info(`TraceId: ${traceId}. Get cookies. Url: ${url}`);
		try {
			const dataRequest = {
				method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'Authorization': 'Bearer ' + accessToken
					},
		  };
		  logger.info(`TraceId: ${traceId}. Request: url: ${url}, data:`, dataRequest);
		  const response = await fetch(url, dataRequest);

		  if (response.status == 401) {
				logger.error(`TraceId: ${traceId}. Server response status 401`);
				return {
					isSuccess: false
				};
		  }
		  
			if (response.status == 500) {
				logger.error(`TraceId: ${traceId}. Server response status 500`);
				return {
					isSuccess: false
				}
			}

		  const content = await response.json();
		  
		  if (response.status == 400) {
				logger.error(`TraceId: ${traceId}. Server response status 400`);
				return {
					isSuccess: false,
					errorMessage: content.errorMessage
				};
		  }
		  
		  if (response.status != 200) {
				logger.error(`TraceId: ${traceId}. Server response status ${response.status}`)
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
			logger.error(`TraceId: ${traceId}. Request error by get cookies`, error);
			return {
				isSuccess: false
			}
		}
	},
	newCookie: async (clientId, resourceUrl, name, value, domain, expirationDate, httpOnly, path, traceId) => {
	  const cookieInfo = {
			name: name,
	    value: value,
			domain: domain,
			expirationDate: expirationDate,
			httpOnly: httpOnly,
			path: path,
			clientId: clientId,
			url: resourceUrl
	  }

	  const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN_STORAGE);
	  
	  const dataRequest = {
	    method: 'POST',
	    headers: {
	      'Content-Type': 'application/json',
	      'Accept': 'application/json',
	      'Authorization': 'Bearer ' + accessToken
	    },
	    body: JSON.stringify(cookieInfo)
	  };
	  
		const url = `${SERVER_ADDRESS()}/api/v2/cookies`;

		logger.info(`TraceId: ${traceId}. Message: update cookie | Url: ${url} | dataContext:`, dataRequest);

	  try {
			const response = await fetch(url, dataRequest);
	    
		  if (response.status == 401) {
				logger.error(`TraceId ${traceId}. Message: Server response status 401`);
				return {
					isSuccess: false
				};
		  }

	    const content = await response.json();
		
		  if (response.status == 400) {
				logger.error(`TraceId: ${traceId}. Message: Server response status 400`, content);
				return {
					isSuccess: false,
				};
		  }	
	    
		  if (response.status != 200) {
				logger.error(`TraceId: ${traceId}. Message: Server response status ${response.status}`)
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
			logger.error(`TraceId: ${traceId}. Message: Request error by update cookie | Error:`, error);
			return {
				isSuccess: false
			}
	  }		
	},
	getClients: async (traceId) => {
		const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN_STORAGE);

		const url = SERVER_ADDRESS() + `/api/v2/cookies/clients`; // TODO: переделать

		logger.info(`TraceId: ${traceId}. Get cookies. Url: ${url}`);
		try {
			const dataRequest = {
				method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'Authorization': 'Bearer ' + accessToken
					},
		  };
		  logger.info(`TraceId: ${traceId}. Request: url: ${url}, data:`, dataRequest);
		  const response = await fetch(url, dataRequest);

		  if (response.status == 401) {
				logger.error(`TraceId: ${traceId}. Server response status 401`);
				return {
					isSuccess: false
				};
		  }
		  
		  const content = await response.json();
		  
		  if (response.status == 400) {
				logger.error(`TraceId: ${traceId}. Server response status 400`, content);
				return {
					isSuccess: false
				};
		  }
		  
		  if (response.status != 200) {
				logger.error(`TraceId: ${traceId}. Server response status ${response.status}`)
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
			logger.error(`TraceId: ${traceId}. Request error by get cookies`, error);
			return {
				isSuccess: false
			}
		}
	},
	removeCookie: async (clientId, resourceUrl, name, traceId) => {
	  const cookieInfo = {
			name: name,
			url: resourceUrl,
			clientId: clientId
	  }

	  const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN_STORAGE);
	  
	  const dataRequest = {
	    method: 'DELETE',
	    headers: {
	      'Content-Type': 'application/json',
	      'Accept': 'application/json',
	      'Authorization': 'Bearer ' + accessToken
	    },
	    body: JSON.stringify(cookieInfo)
	  };
	  
		const url = `${SERVER_ADDRESS()}/api/v2/cookies`;

		logger.info(`TraceId: ${traceId}. Message: update cookie | Url: ${url} | dataContext:`, dataRequest);

	  try {
			const response = await fetch(url, dataRequest);
	    
		  if (response.status == 401) {
				logger.error(`TraceId ${traceId}. Message: Server response status 401`);
				return {
					isSuccess: false
				};
		  }

	    const content = await response.json();
		
		  if (response.status == 400) {
				logger.error(`TraceId: ${traceId}. Message: Server response status 400`, content);
				return {
					isSuccess: false,
				};
		  }	
	    
		  if (response.status != 200) {
				logger.error(`TraceId: ${traceId}. Message: Server response status ${response.status}`)
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
			logger.error(`TraceId: ${traceId}. Message: Request error by update cookie | Error:`, error);
			return {
				isSuccess: false
			}
	  }		
	},
}