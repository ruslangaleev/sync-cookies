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
  logger.log(`ACCESS TOKEN: ${accessToken}`);

  // Обнуляем, так как могут закрыть браузер, без переключения флага (IS_ENABLE)
  await setInLocalStorageAsync(COOKIE_INFOES_STORAGE, null);
  
  await configureSignalR();

  logger.info('configured');

  return true;
}

 /**
  * Подгружает информацию с сервера о куках, которые необходимо синхронизировать
  */
async function initialCookiesForSync(traceId) {
  logger.info("[Start...] Get cookie infos from server");
  const result = await syncCookieClient.getCookies(traceId);

  if (!result.isSuccess) {
    return false;
  }

  logger.info("[Done] Get cookie infos from server", result.content);

  await setInLocalStorageAsync(COOKIE_INFOES_STORAGE, result.content);

  return result.content;
}

async function run() {
  const traceId = uuidv4();
  const result = await initialCookiesForSync(traceId);

	result.forEach(cookieInfo => {
		cookieInfo.cookies.forEach(async (cookie) => {
      
      // TODO: Если такой кук уже есть в браузере, то удаляем в браузере старый
      
			const key = UPDATE_FROM_SERVER_STORAGE + `_${cookieInfo.url}_${cookie.name}`;
      logger.log(`Configure | updateFromServerkey: ${key} | existCookie:`, cookie);
			await setInLocalStorageAsync(key, cookie);
      
			if (cookie.value) {
				await setCookie({
					url: cookieInfo.url,
					name: cookie.name,
					value: cookie.value,
					domain: cookie.domain,
					expirationDate: cookie.expirationDate
				});
			}
		});
	});

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
  // TODO: В ACCESS_TOKEN содержится NULL. Выполнится ли run после configure?
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

    logger.log(`New Cookie`, cookie);

    // записываем в хранилище что с сервера пришел новый кук, для того чтобы этот новый кук снова не отправить на сервер
    const key = UPDATE_FROM_SERVER_STORAGE + `_${cookie.url}_${cookie.name}`;
    await setInLocalStorageAsync(key, cookie);

    await setCookie(cookie);
  });
  
  connection.onclose(main);
}

let signalRTimerId;

async function runSignalR() {
	try {
		clearTimeout(signalRTimerId);

		logger.log(`Try connect by signalR`);
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
		logger.log(`Try disconnect by signalR`);
		await connection.stop();
		logger.info(`SignalR disconnected`);
	} catch (error) {
		logger.error(`SignalR disconnect error`, error);
		signalRTimerId = setTimeout(stop, 5000);
	}  
}

// Здесь выполняется когда открывается брайзер
main();