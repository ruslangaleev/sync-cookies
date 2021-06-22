let connection;

// Инициализация.
async function initial() {
	// Прерываем если после установки расширения запущена синхронизация
	if (!await isSyncStarted()) {
		return;
	}

	console.log(`${STARTUP_PRE} | INITIAL | START`);

	// обнуляем переменные
	await setInLocalStorageAsync(COOKIE_INFOES, null);
	// TODO: КАК ПОДЧИСТИТЬ ОСТАЛЬНЫЕ ПЕРЕМЕННЫЕ?

	await initialSignalR();

	console.log(`${STARTUP_PRE} | INITIAL | END`);
}

// Подключение к серверу.
async function connect() {
	console.log(`${STARTUP_PRE} | CONNECT | START`);

	// инициалируются куки в хранилище
	await initialCookies();

	// подключение по сокетам
	await startSignalR();

	console.log(`${STARTUP_PRE} | CONNECT | END`);
}

// Когда signalR теряет соединение, есть вероятность потерять любые данные. Повторное подключение к серверу.
async function reconnect() {
	console.log(`${STARTUP_PRE} | RECONNECT | START`);

	// Прерываем если во время неудачных подключений отключили синхронизацию
	if (!await isSyncStarted()) {
		return;
	}

	// инициалируются куки в хранилище
	await initialCookies();

	await startSignalR();

	console.log(`${STARTUP_PRE} | RECONNECT | END`);
}

async function disconnect() {
	// Прерываем если синхронизация итак была отключена
	if (!await isSyncStarted()) {
		return;
	}
	
	await stopConnectSignalR();

	await setInLocalStorageAsync(COOKIE_INFOES, null);
}

async function stopConnectSignalR() {
	try {
		console.log(`${STARTUP_PRE}/STOPCONNECTSIGNALR | TRY DISCONNECT`);
		await connection.stop();
		console.log(`${STARTUP_PRE}/STOPCONNECTSIGNALR | DISCONNECTED`);
	} catch {
		console.log(`${STARTUP_PRE}/STOPCONNECTSIGNALR | ERROR DISCONNECT`);
		setTimeout(stopConnection, 5000);
	}
}

// Запущена ли синхронизация.
async function isSyncStarted() {
	return await getFromLocalStorageAsync(IS_ENABLE);
}

// После инициализации выполняется подключение.
initial().then(_ => connect());

async function initialSignalR() {
	console.log(`${STARTUP_PRE} | INITIAL SIGNALR | START`);

	const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN)

	connection = new signalR.HubConnectionBuilder()
	    .withUrl(SERVER_ADDRESS + "/hubs/cookie", { 
			accessTokenFactory: () => accessToken,
			transport: signalR.HttpTransportType.WebSockets
		}) // с приминением jwt
	    .configureLogging(signalR.LogLevel.Information)
	    .build();

	connection.on('NewCookie', async (cookie) => {
		console.log(`NEW COOKIE | ID: ${cookie.id} | NAME: ${cookie.name} | VALUE: ${cookie.value} | URL: ${cookie.url}`);

		const key = UPDATE_FROM_SERVER + `_${cookie.url}_${cookie.name}`;
		console.log(`RECEIVE COOKIE | STORAGE KEY: ${key}`);
		await setInLocalStorageAsync(key, cookie);
		await setCookie(cookie);
	});

	connection.on('NewResource', async (newResource) => {
		console.log(`NEW RESOURCE | RESOURCE_ID: ${newResource.resourceId} | START`, newResource);

		const cookieInfoes = await getFromLocalStorageAsync(COOKIE_INFOES);
		cookieInfoes.push(newResource);
		await setInLocalStorageAsync(COOKIE_INFOES, cookieInfoes);

		newResource.cookies.forEach(async (cookie) => {
			const key = UPDATE_FROM_SERVER + `_${newResource.url}_${cookie.name}`;
			await setInLocalStorageAsync(key, cookie);
			await setCookie({
				url: newResource.url,
				name: cookie.name,
				value: cookie.value,
				domain: cookie.domain,
				expirationDate: cookie.expirationDate
			});
		});
		console.log(`NEW RESOURCE | RESOURCE_ID: ${newResource.resourceId} | END`, newResource);
	});

	// TOOD: Если отключили подписку

	connection.onclose(reconnect);

	console.log(`${STARTUP_PRE} | INITIAL SIGNALR | END`);
}

async function initialCookies() {
	// ошибки бывают серверные, из за которых прерываем.
	// Ошибки бывают в подключениях, из за которых мы пытаемся снова подключиться
	console.log(`${STARTUP_PRE} | INITIAL COOKIES | START`);

	const result = await syncCookieClient.getCookies();

	console.log(`${STARTUP_PRE} | INITIAL COOKIES | COOKIE INFOES`, result);

	if (!result.success) {
		if (!result.serverError) {
			return;
		}
	}

	await setInLocalStorageAsync(COOKIE_INFOES, result.content);

	// Все полученные куки обновляем в браузере
	result.content.forEach(cookieInfo => {
		cookieInfo.cookies.forEach(async (cookie) => {
			const key = UPDATE_FROM_SERVER + `_${cookieInfo.url}_${cookie.name}`;
			await setInLocalStorageAsync(key, cookie);
			if (!cookie.value) {
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

	console.log(`${STARTUP_PRE} | INITIAL COOKIES | END`);
}

let signalRTimerId;

async function startSignalR() {
	try {
		clearTimeout(signalRTimerId);

		console.log(`${STARTUP_PRE} | START SIGNALR | TRY SIGNALR CONNECT`);
		// Если при подключении выбрасывает exception и после переключении флага на DISABLE
		const isEnable = await getFromLocalStorageAsync(IS_ENABLE);
		if (!isEnable) {
			return;
		}

		await connection.start();
		console.log(`${STARTUP_PRE} | START SIGNALR | SIGNALR CONNECTED`);
	} catch {
		// Если связь оборвется, можно упустить какую то куку. И при успешном подключении, нужно снова тянуть список, возможно есть новые обновления
		console.log(`${STARTUP_PRE} | START SIGNALR | SIGNALR ERROR CONNECT`);
		signalRTimerId = setTimeout(reconnect, 5000);
	}
}

async function setInLocalStorageAsync(key, value) {
	return await new Promise((resolve, reject) => {
		chrome.storage.local.set({[key]: value}, () => {
			resolve(true);
		});		
	})
}

async function getFromLocalStorageAsync(key) {
	return await new Promise((resolve, reject) => {
		chrome.storage.local.get([key], (result) => {
			resolve(result[key]);
		});		
	})
}