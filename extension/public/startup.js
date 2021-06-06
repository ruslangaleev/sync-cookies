let connection;

async function startup() {
	// После установки расширения, необходимо проверять, запушена ли синхронизация
	const isEnable = await getFromLocalStorageAsync(IS_ENABLE);
	if (!isEnable) {
		return;
	}

	console.log(`${STARTUP_PRE} START CONFIG`);

	await initialSignalR();
	await initialCookies();

	console.log(`${STARTUP_PRE} END CONFIG`);
}

async function endup() {
	try {
		console.log(`${STARTUP_PRE} SIGNALR TRY DISCONNECT`);
		await connection.stop();
		console.log(`${STARTUP_PRE} SIGNALR DISCONNECTED`);
	} catch {
		console.log(`${STARTUP_PRE} SIGNALR ERROR DISCONNECT`);
		setTimeout(startSignalR, 5000);
	}
}

async function initialSignalR() {
	const serverAddress = await getFromLocalStorageAsync(SERVER_ADDRESS);
	const accessToken = await getFromLocalStorageAsync(ACCESS_TOKEN)

	connection = new signalR.HubConnectionBuilder()
	    .withUrl(serverAddress + "/hubs/cookie", { accessTokenFactory: () => accessToken }) // с приминением jwt
	    .configureLogging(signalR.LogLevel.Information)
	    .build();

	connection.on('NewCookie', async (cookie) => {
		console.log(`NEW COOKIE | ID: ${cookie.id} | NAME: ${cookie.name} | VALUE: ${cookie.value} | URL: ${cookie.url}`);

		const key = UPDATE_FROM_SERVER + `_${cookie.url}_${cookie.name}`;
		console.log(`RECEIVE COOKIE | STORAGE KEY: ${key}`);
		await setInLocalStorageAsync(key, cookie);
		await setCookie(cookie);
	});

	connection.onclose(startSignalR);

	console.log(`${STARTUP_PRE} SIGNALR CONFIG DONE`);

	await startSignalR();
}

async function initialCookies() {
	const cookieInfoes = await syncCookieClient.getCookies();
	await setInLocalStorageAsync(COOKIE_INFOES, cookieInfoes);
	
	// Все полученные куки обновляем в браузере
	cookieInfoes.forEach(cookieInfo => {
		cookieInfo.cookies.forEach(async (cookie) => {
			const key = UPDATE_FROM_SERVER + `_${cookieInfo.url}_${cookie.name}`;
			await setInLocalStorageAsync(key, cookie);
			await setCookie({
				url: cookieInfo.url,
				name: cookie.name,
				value: cookie.value,
				domain: cookie.domain
			});
		});
	});

	console.log('STARTUP | INITIAL COOKIE INFOES DONE', cookieInfoes);
}

async function startSignalR() {
	try {
		// Если при подключении выбрасывает exception и после переключении флага на DISABLE
		const isEnable = await getFromLocalStorageAsync(IS_ENABLE);
		if (!isEnable) {
			return;
		}		

		console.log(`${STARTUP_PRE} TRY SIGNALR CONNECT`);
		await connection.start();
		console.log(`${STARTUP_PRE} SIGNALR CONNECTED`);
	} catch {
		console.log(`${STARTUP_PRE} SIGNALR ERROR CONNECT`);
		setTimeout(startSignalR, 5000);
	}
}

startup();

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