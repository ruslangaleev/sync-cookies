
// Данное событие обрабатывает все входящие заголовки
// Если в заголовке ответа есть статус 401, значит клиент (браузер) потерял доступ к ресурсу и необходимо заново авторизоваться
// Но при этом, если есть статус 401, то зачищаем все куки этого ресурса, т.к. возникают проблемы зацикливания запросов
// chrome.webRequest.onHeadersReceived.addListener(async (details) => {
// 	if (!await isSyncEnabled()) {
// 		return console.log('Sync is disabled');
// 	}

// 	const traceId = uuidv4();
// 	const statusCode = details.statusCode;
// 	const initiator = details.initiator;

// 	// Синхронизация может быть включена, то на сервере не заведены источники
// 	const cookieInfoes = await getFromLocalStorageAsync(COOKIE_INFOES);
// 	if (!cookieInfoes) {
// 		return;
// 	}
	
// 	// Хоть и источники на сервере могут быть заведены, то могут не совпадать с текущими запросами
// 	const resource = cookieInfoes.find(info => info.url.indexOf(initiator) > -1);
// 	if (!resource) {
// 		return;
// 	}

// 	if (statusCode == 401) {
// 		resource.cookies.forEach(cookie =>
// 			chrome.cookies.remove({
// 				url: resource.url,
// 				name: cookie.name
// 			}, (cookie) => {
// 				console.log(`TraceId: ${traceId} | Deleted cookie | Url: ${resource.url} | Name: ${cookie.name}`);
// 			})
// 		);
// 	}
// }, { urls: ["<all_urls>"] });

async function isSyncEnabled() {
	return await getFromLocalStorageAsync(IS_ENABLE);
}

chrome.cookies.onChanged.addListener(async (changeInfo) => {
	if (!await isSyncEnabled()) {
		return console.log('Sync is disabled');
	}

	const traceId = uuidv4();

	const cookieName = changeInfo.cookie.name;
	const cookieValue = changeInfo.cookie.value;
	const cookieDomain = changeInfo.cookie.domain;
	const expirationDate = changeInfo.cookie.expirationDate;

	const cookieInfoes = await getFromLocalStorageAsync(COOKIE_INFOES);
	if (!cookieInfoes) {
		return;
	}

	const resource = cookieInfoes.find(info => info.url.indexOf(cookieDomain) > -1);
	if (!resource) {
		return;
	}

	// Настроен ли такой кук на синхронизацию
	const cookie = resource.cookies.find(cookie => cookie.name == cookieName);
	if (!cookie) {
		return;
	}

	// Если со стороны источника происходит обновление куков, происходят следующие шаги:
	// Выполняется "cause: overwrite" с "removed: true", то есть сначала куки удаляются, а потом записываются
	// В результате будут вызваны 2 события: 
	//      1. cause: overwrite; removed: true
	//      2. cause: explicit; removed: false
	if (changeInfo.cause == 'overwrite') {
		const key = UPDATE_FROM_SERVER + `_${resource.url}_${cookieName}`;
		const existCookie = await getFromLocalStorageAsync(key);

		// existCookie - c сервера
		// cookieValue - изменения из куков
		if ((existCookie?.value || cookieValue) && (existCookie?.value != cookieValue)) {
			console.log(`${COOKIES_ON_CHANGED} > overwrite > start update cookie id: ${cookie.id}, name: ${cookieName}, new value: ${cookieValue}`);
			const result = await syncCookieClient.updateCookie(cookie.id, cookieValue, expirationDate);
			if (result.status == 500) {
				setTimeout(async () => await syncCookieClient.updateCookie(cookie.id, cookieValue, expirationDate), 5000);
			}

			if (result.status != 200) {
				console.log(`${COOKIES_ON_CHANGED} > overwrite > response status: ${result.status}, error message: `, result);
				return;
			}

			console.log(`success send cookie id: ${cookie.id}, name: ${cookieName}, value: ${cookieValue}`);
		}

		return;
	}

	// Если вручную удалили куки
	if (changeInfo.cause == 'explicit' && changeInfo.removed) {
		console.log(`${COOKIES_ON_CHANGED} > explicit > cookie name: ${cookieName}`);
		const existCookie = await syncCookieClient.getCookie(cookie.id);
		await setCookie(existCookie);

		console.log(`${COOKIES_ON_CHANGED} > updated cookie: ${cookieName}`, existCookie);
	}

	// TODO: Это возможно даже и не нужно
	// Если у куков закончился срок годности
	// if (changeInfo.cause == 'expired_overwrite' && changeInfo.removed) {
	// 	console.log(`${COOKIES_ON_CHANGED} > expired_overwrite > cookie name: ${cookieName}`);

	// 	const result = await syncCookieClient.updateCookie(cookie.id, '', 0);

	// 	if (result.status != 200) {
	// 		console.log(`${COOKIES_ON_CHANGED} > expired_overwrite > response status: ${result.status}, error message: `, result.errorMessage);
	// 		return;
	// 	}
		
	// 	return;
	// }
});

// TODO: то что ниже перенести в другой файл
async function setCookie(cookieSource) {
	return await new Promise((resolve, reject) => {
		chrome.cookies.set({
			url: cookieSource.url,
			name: cookieSource.name,
			value: cookieSource.value,
			domain: cookieSource.domain,
			expirationDate: cookieSource.expirationDate
		}, (cookie) => {
			resolve(cookie);
		})
	});
}

async function setCookie(cookieSource) {
	return await new Promise((resolve, reject) => {
		chrome.cookies.set({
			url: cookieSource.url,
			name: cookieSource.name,
			value: cookieSource.value,
			domain: cookieSource.domain,
			expirationDate: cookieSource.expirationDate
		}, (cookie) => {
			resolve(cookie);
		})
	});
}

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
	});
  }