chrome.cookies.onChanged.addListener(async (changeInfo) => {
	const isEnable = await getFromLocalStorageAsync(IS_ENABLE);
	if (!isEnable) {
		return;
	}

	const cookieName = changeInfo.cookie.name;
	const cookieValue = changeInfo.cookie.value;
	const cookieDomain = changeInfo.cookie.domain;
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

	//console.log('COOKIE ON CHANGED | COOKIE INFOES', cookieInfoes);

	/*
		Куки обновлены/добавлен новый
	*/
	if (changeInfo.cause == 'explicit' && !changeInfo.removed) {
		const key = UPDATE_FROM_SERVER + `_${resource.url}_${cookieName}`;
		console.log(`COOKIE ON CHANGED | STORAGE KEY: ${key}`);
		const existCookie = await getFromLocalStorageAsync(key);
		if (existCookie?.value != cookieValue) {
			console.log(`UPDATE | COOKIEID: ${cookie.id} | NAME: ${cookieName} | VALUE: ${cookieValue}`);
			// Обновление произошло со стороны клиента. Необходимо отправить на сервер
			//const cookieInfoes = await getFromLocalStorageAsync(COOKIE_INFOES);
			await syncCookieClient.updateCookie(cookie.id, cookieValue);
		}

		return;
	}

	/*
		Куки удалены
	*/
	if (changeInfo.cause == 'explicit' && changeInfo.removed) {
		const existCookie = await syncCookieClient.getCookie(cookie.id);
		await setCookie(existCookie);

		console.log(`С сервера обновлен кук ${cookieName}`, existCookie);
	}
});

// TODO: то что ниже перенести в другой файл
async function setCookie(cookieSource) {
	return await new Promise((resolve, reject) => {
		chrome.cookies.set({
			url: cookieSource.url,
			name: cookieSource.name,
			value: cookieSource.value,
			domain: cookieSource.domain
		}, (cookie) => {
			resolve(cookie);
		})
	});
}