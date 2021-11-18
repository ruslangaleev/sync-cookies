async function configure() {
  const isEnable = await getFromLocalStorageAsync(IS_ENABLE_STORAGE);
  // После установки расширения или обновления расширения текущая процедура будет выполняться.
  // И для того чтобы она ложно не запустилась, необходимо убедиться, был ли переключен флаг.
  if (!isEnable) {
    logger.warn('Extension is disabled');
    return false;
  }

  const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN_STORAGE);
  if (!accessToken) {
    logger.warn(`ACCESS_TOKEN not found`);
    return false;
  }
  logger.info(`ACCESS TOKEN: ${accessToken}`);

  // Обнуляем, так как могут закрыть браузер, без переключения флага (IS_ENABLE)
  //await setInLocalStorageAsync(COOKIE_INFOES_STORAGE, null);
  
  await configureSignalR();

  logger.info('Настройка выполнена');

  return true;
}

async function initializeClients() {
  const clientsFromServer = await v2syncCookieClient.getClients();
  if (!clientsFromServer.isSuccess) {
    return false;
  }

  clients = clientsFromServer.content;

  console.info("Клиенты:", clients);
}

async function initializeAllCookies() {
  const result = await v2syncCookieClient.getCookies();
  
  if (!result.isSuccess) {
    return false;
  }

  logger.info('Receive cookies from server', result.content);

	result.content.forEach(async cookie => {
    // храним с storage только clientId. Если будет изменение по кукам, нам достаточно этого знать
    //await setInLocalStorageAsync(cookie.resourceUrl, cookie.clientId);

    var newCookie = {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      expirationDate: cookie.expirationDate,
      httpOnly: cookie.httpOnly,
      path: cookie.path,
      url: cookie.url
    };

    await setCookie(newCookie);
	});  
}

async function run() {
  await initializeClients();

  await initializeAllCookies();

  // Подключаемся по сокетам
  await runSignalR();

  logger.info('launched');
}

async function stop() {
  // Отключаемся от сокетов
  await stopSignalR();

  logger.info('stopped');
}

async function main() {
  logger.info('Запуск инициализации и настройки');
  const isSuccess = await configure();
  if (isSuccess) {
    await run();
  }
}

async function configureSignalR() {
  const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN_STORAGE);

	connection = new signalR.HubConnectionBuilder()
	  .withUrl(SERVER_ADDRESS() + "/hubs/cookie", { 
			accessTokenFactory: () => accessToken,
			transport: signalR.HttpTransportType.WebSockets
		}) // с приминением jwt
	  .configureLogging(signalR.LogLevel.Information)
	  .build();

  connection.on('NewCookie', async (cookie) => {
    const isEnable = await getFromLocalStorageAsync(IS_ENABLE_STORAGE);

    if (!isEnable) {
      logger.warn('Extension is disabled');
      return false;
    }

    await setInLocalStorageAsync(`server_${cookie.url}`, cookie.name);

    await setCookie({
      url: cookie.url,
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      expirationDate: cookie.expirationDate,
      httpOnly: cookie.httpOnly,
      path: cookie.path
    });

    logger.info(`Новый куки с сервера`, cookie);
  });

  connection.on('RemoveCookie', async (cookie) => {
    const isEnable = await getFromLocalStorageAsync(IS_ENABLE_STORAGE);

    if (!isEnable) {
      logger.warn('Extension is disabled');
      return false;
    }

    await setInLocalStorageAsync(`server_${cookie.url}`, cookie.name);

    await removeCookie({
      name: cookie.name,
      url: cookie.url
    })

    logger.info(`Удален кук с сервера`, cookie);
  });  
  
  connection.onclose(main);
}

let signalRTimerId;

async function runSignalR() {
	try {
		clearTimeout(signalRTimerId);

		logger.info(`Try connect by signalR`);
		// Если при подключении выбрасывает exception и после переключении флага на DISABLE
		const isEnable = await getFromLocalStorageAsync(IS_ENABLE_STORAGE);
		if (!isEnable) {
			return;
		}

		await connection.start();
		logger.info(`SignalR connected`);
	} catch (error) {
		// Если связь оборвется, можно упустить какую то куку. И при успешном подключении, нужно снова тянуть список, возможно есть новые обновления
		logger.error(`SignalR connect error`, error);
		signalRTimerId = setTimeout(run, 5000);
	}
}

async function stopSignalR() {
	try {
		logger.info(`Try disconnect by signalR`);
		await connection.stop();
		logger.info(`SignalR disconnected`);
	} catch (error) {
		logger.error(`SignalR disconnect error`, error);
		signalRTimerId = setTimeout(stop, 5000);
	}  
}

// Здесь выполняется когда открывается брайзер
main();