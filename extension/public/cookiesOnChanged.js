chrome.cookies.onChanged.addListener(async (changeInfo) => {
  const traceId = uuidv4();
  // logger.log(`TraceId: ${traceId} | cookiesOnChanged`, changeInfo);
  const isEnable = await getFromLocalStorageAsync(IS_ENABLE_STORAGE);
  if (!isEnable) {
    logger.warn('Extension is disabled');
    return;
  }

	const cookieName = changeInfo.cookie.name;
	const cookieValue = changeInfo.cookie.value;
	const cookieDomain = changeInfo.cookie.domain;
	const expirationDate = changeInfo.cookie.expirationDate;

  //logger.log(`TraceId: ${traceId} | cause: ${changeInfo.cause} | cookieName: ${cookieName} | changeInfo: `, changeInfo);

  // Вся информация, которая была получена от сервер: адрес источника, из которого необходимо брать куки; какие куки необходимо брать
	const cookieInfoes = await getFromLocalStorageAsync(COOKIE_INFOES_STORAGE);
	if (!cookieInfoes) {
		logger.warn('Cookie Infoes not found')
		return;
	}

	const resource = cookieInfoes.find(info => info.url.indexOf(cookieDomain) > -1);
	if (!resource) {
		return;
	}

	// Настроен ли такой кук на синхронизацию?
	const cookie = resource.cookies.find(cookie => cookie.name == cookieName);
	if (!cookie) {
    //logger.warn(`TraceId: ${traceId} failed`);
		return;
	}

  // Возникла проблема: После автоматической установки куков, спустя время браузер дублирует этот же кук, но с другим доменом.
  // Решить проблему удается только вручную удалив куки и автотически подгрузив с сервера. Скорее Chrome дубликаты сам создает
  // Неважно, кук удаляется или создается, мы просто смотрим, если такой кук уже есть в браузере, то оба удаляем и подгружаем с сервера
  var cookies = await getCookieAll(cookieName, resource.url);
  if (cookies) {
    if (cookies.length > 1) {
      await removeCookie(cookieName, resource.url);
      return;
    }
  }

  // Если произошла запись нового кука в браузере, не важно, вручную или от первоистоника
	if (changeInfo.cause == 'explicit' && !changeInfo.removed) {
    logger.log(`TraceId ${traceId} | cause: explicit, removed: false | Cookie name: ${cookieName} | Url ${resource.url} | Value: ${cookieValue}`);

    // TODO: локально при проверке, если background инициализирует куки, то данное событие не вызывается
    
    // Если с сервера пришли новые куки, то после установки куков в браузер, вызывется текущее событие
    const updateFromServerkey = `${UPDATE_FROM_SERVER_STORAGE}_${resource.url}_${cookieName}`;
    const existCookie = await getFromLocalStorageAsync(updateFromServerkey);
    logger.log(`TraceId ${traceId} | updateFromServerkey: ${updateFromServerkey} | existCookie:`, existCookie);
    if (existCookie.value == cookieValue) {
      // Поэтому сбрасываем если куки пришли от нашего сервера
      // TODO: Проверить вообще, работает ли удаление
      //await removeFromLocalStorageAsync(updateFromServerkey);
      return;
    }

    // Если куки пришли из первоисточника, то отправляем на наш сервер
    var result = await syncCookieClient.updateCookie(cookie.id, cookieValue, expirationDate, traceId);

    if (result.isSuccess) {
      logger.info(`TraceId: ${traceId} | Message: success sent | Cookie name: ${cookieName} | Url: ${resource.url}`);
    }

    return;
  }

	// Если вручную удалили куки
	if (changeInfo.cause == 'explicit' && changeInfo.removed) {
    logger.log(`TraceId: ${traceId} | cause: ${changeInfo.cause}, removed: ${changeInfo.removed} | Cookie name: ${cookieName} | Url: ${resource.url} | Value: ${cookieValue}`);

		const result = await syncCookieClient.getCookie(cookie.id, traceId);

    if (result.isSuccess)
    {
      logger.info(`TraceId: ${traceId} | Message: success get from server | Url: ${resource.url} | Content:`, result.content);
      await setCookie(result.content);
    }
	}
});