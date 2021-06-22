const COOKIES_ON_CHANGED = 'cookiesOnChanged';

chrome.cookies.onChanged.addListener(async (changeInfo) => {
	const isEnable = await getFromLocalStorageAsync(IS_ENABLE);
	if (!isEnable) {
		return;
	}

	const cookieName = changeInfo.cookie.name;
	const cookieValue = changeInfo.cookie.value;
	const cookieDomain = changeInfo.cookie.domain;
	const expirationDate = changeInfo.cookie.expirationDate;
	const cookieInfoes = await getFromLocalStorageAsync(COOKIE_INFOES);

	if (!cookieInfoes) {
		return;
	}

	// По какому домену пришли куки?
	const resource = cookieInfoes.find(info => info.url.indexOf(cookieDomain) > -1);
	if (!resource) {
		return;
	}

	const cookie = resource.cookies.find(cookie => cookie.name == cookieName);
	if (!cookie) {
		return;
	}

	// Если со стороны источника происходит обновление куков, происходят следующие шаги:
	// Выполняется "cause: overwrite" с "removed: true", то есть сначала куки удаляются, а потом записываются
	// В результате будут вызваны 2 события: 
	//      1. cause: overwrite; removed: true
	//      2. cause: explicit; removed: false
	//if (changeInfo.cause == 'explicit' && !changeInfo.removed) { - изначально был этот код
	if (changeInfo.cause == 'overwrite') {
		const key = UPDATE_FROM_SERVER + `_${resource.url}_${cookieName}`;
		console.log(`${COOKIES_ON_CHANGED} > overwrite > server cookie key for storage : ${key}`);
		const existCookie = await getFromLocalStorageAsync(key);
		console.log(`${COOKIES_ON_CHANGED} > overwrite > server cookie from storage:`, existCookie);

		// existCookie - c сервера
		// cookieValue - изменения из куков
		if ((existCookie?.value || cookieValue) && (existCookie?.value != cookieValue)) {
			console.log(`${COOKIES_ON_CHANGED} > overwrite > start update cookie id: ${cookie.id}, name: ${cookieName}, new value: ${cookieValue}`);
			await syncCookieClient.updateCookie(cookie.id, cookieValue, expirationDate);
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