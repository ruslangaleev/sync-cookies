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

  // cause: overwrite, removed: true - происходит удаление кука с текущим значением
  // cause: explicit, removed: false - установка нового значения в куки

  // cause: overwrite, removed: true & cause: explicit, removed: false - командой меняем значение в куках, даже если вручную меняем значение
  // cause: explicit, removed: false - обновление кука от источника
  // cause: explicit, removed: true - вручную удалили кук

  // Если произошла запись нового кука в браузере, не важно, вручную или от первоистоника
	if (changeInfo.cause == 'explicit' && !changeInfo.removed) {
    logger.log(`TraceId ${traceId} | cause: explicit, removed: false | Cookie name: ${cookieName} | Url ${resource.url} | Value: ${cookieValue}`);

    // TODO: локально при проверке, если background инициализирует куки, то данное событие не вызывается
    /*
    // Если с сервера пришли новые куки, то после установки куков в браузер, вызывется текущее событие
    const updateFromServerkey = `${UPDATE_FROM_SERVER_STORAGE}_${resource.url}_${cookieName}`;
    const existCookie = await getFromLocalStorageAsync(updateFromServerkey);
    logger.log(`TraceId ${traceId} | updateFromServerkey: ${updateFromServerkey} | existCookie:`, existCookie);
    if (existCookie) {
      // Поэтому сбрасываем если куки пришли от нашего сервера
      await removeFromLocalStorageAsync(updateFromServerkey);
      return;
    }
    */

    // Если куки пришли из первоисточника, то отправляем на наш сервер
    var result = await syncCookieClient.updateCookie(cookie.id, cookieValue, expirationDate, traceId);

    if (result.isSuccess) {
      logger.info(`TraceId: ${traceId} | Message: success sent | Cookie name: ${cookieName} | Url: ${resource.url}`);
    }

    return;
  }

	// Если вручную удалили куки
	if (changeInfo.cause == 'explicit' && changeInfo.removed) {
    logger.log(`TraceId: ${traceId} | cause: explicit, removed: false | Cookie name: ${cookieName} | Url: ${resource.url} | Value: ${cookieValue}`);

		const result = await syncCookieClient.getCookie(cookie.id, traceId);

    if (result.isSuccess)
    {
      logger.info(`TraceId: ${traceId} | Message: success get from server | Url: ${resource.url} | Content:`, result.content);
      await setCookie(result.content);
    }
	}
});