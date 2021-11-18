chrome.cookies.onChanged.addListener(async (changeInfo) => {
  // ВАЖНО! О ситуации: пользователь может зайти в настройки браузера, очистить кэш брайзера, тем самым куки удаляются и удаляются на на других пользователях.
  // Чтобы не удалить куки которые и так валидные на сервере, мы будем принимать события которые поступают с активной страницы "Очистить историю"
  var currentUrl = await getCurrentUrl();
  if (currentUrl == "chrome://settings/clearBrowserData") {
    return;
  }

  const traceId = generateTraceId();
  const isEnable = await getFromLocalStorageAsync(IS_ENABLE_STORAGE);
  if (!isEnable) {
    logger.warn('Extension is disabled');
    return;
  }

	const cookieName = changeInfo.cookie.name;
	const cookieValue = changeInfo.cookie.value;
	const cookieDomain = changeInfo.cookie.domain;
	const cookieExpirationDate = changeInfo.cookie.expirationDate;
  const cookieHttpOnly = changeInfo.cookie.httpOnly;
  const cookiePath = changeInfo.cookie.path;

  if (clients.length == 0) {
    logger.error('clients is empty');
    await initializeClients();
  }

  const clientFromServer = clients.find(info => info.url.indexOf(cookieDomain) > -1);
  if (!clientFromServer) {
    return;
  }

  // ВАЖНО! Возникает зацикленность. 
  // На тачке А: событие новые куки > Отправляем на сервер > Тачка B принимает новые куки из сервера и: событие новые куки > Отправляем на сервер > На тачке А ...
  var serverCookie = await getFromLocalStorageAsync(`server_${clientFromServer.url}`);
  if (serverCookie) {
    await setInLocalStorageAsync(`server_${clientFromServer.url}`, null);
    return;
  }

  // явно добавили
	if (changeInfo.cause == 'explicit' && !changeInfo.removed) {
    //logger.info(`TraceId: ${traceId}. explicit. noRemoved.`, changeInfo);

    await v2syncCookieClient.newCookie(
      clientFromServer.clientId, 
      clientFromServer.url, 
      cookieName, 
      cookieValue, 
      cookieDomain, 
      cookieExpirationDate, 
      cookieHttpOnly, 
      cookiePath, 
      traceId);

    return;
  }

	// явно удалили
	if (changeInfo.cause == 'explicit' && changeInfo.removed) {
    // logger.info(`TraceId: ${traceId}. explicit. removed`, changeInfo);

    await v2syncCookieClient.removeCookie(clientFromServer.clientId, clientFromServer.url, cookieName, traceId);

    return;
	}

  if (changeInfo.cause == 'expired_overwrite' && changeInfo.removed) {
    // logger.info(`TraceId: ${traceId}. expiredOverwrite. removed`, changeInfo);

    await v2syncCookieClient.removeCookie(clientFromServer.clientId, clientFromServer.url, cookieName, traceId);

    return;
  }

  // logger.info(`Unknown cause. Name: ${cookieName}. Value: ${cookieValue}`, changeInfo);
});

async function getCurrentUrl() {
	return await new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      let url = tabs[0]?.url;
      resolve(url);
    });		
	})
}