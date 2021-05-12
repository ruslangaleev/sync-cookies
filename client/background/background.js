chrome.cookies.onChanged.addListener((changeInfo) => {
	const cookieNames = ['token', 'auth.check', 'device', 'ngtoken', 'portaluserid', 'auth.sid', '.AUTHZAKUPKI'];

	if (changeInfo == 'explicit') {
		// Запрашиваем с сервера
	}

	if (changeInfo == 'overwrite') {
		// Отправляем на сервер

	}

	console.log(changeInfo);
});

