const COOKIE_INFOES = 'sc_cookie_infoes';
const SERVER_URL = 'sc_server_url';

const cookieInfoes = [
	{ url: 'https://zakupki.kontur.ru', domain: 'kontur.ru', names: ['token', 'auth.check', 'device', 'ngtoken', 'portaluserid', 'auth.sid', '.AUTHZAKUPKI', 'testcookie'] },
	{ url: 'http://localhost:5000', domain: 'localhost', names: ['testcookie'] }
]
setInLocalStorageAsync(COOKIE_INFOES, cookieInfoes);
setInLocalStorageAsync(SERVER_URL, 'http://localhost:5000');

//----------------------------------------------------

let connection;

async function initialSignalR() {
	const serverAddress = await getFromLocalStorageAsync(SERVER_URL);

	connection = new signalR.HubConnectionBuilder()
	    .withUrl(serverAddress + "/hubs/cookie")
	    .configureLogging(signalR.LogLevel.Information)
	    .build();	

/* Поступление сообщение из сервера */
	connection.on('NewCookie', async (cookie) => {
		/*
	    chrome.cookies.getAll({ url: "http://localhost:5000" }, cookies => {
	    	console.log('cookies', cookies);
	    });
	    */

		//console.log('cookie', cookie);
		// Записываем cookie в storage чтобы в дальнейшем можно было отличать, куки были обновлены со стороны сервера или вручную
		const key = `sc_fromserver_${cookie.url}_${cookie.name}`;
		await setInLocalStorageAsync(key, cookie);
		await setCookie(cookie);

		console.log(key, await getFromLocalStorageAsync(key));

		console.log('Обновлен кук', cookie);
	});

	connection.onclose(start);
}

async function start() {
	try {
		await initialSignalR();
		await connection.start();
		console.log('Соединение с сервером установлено');
	} catch (err) {
		console.log(`Не удалось установить соединение с сервером | err: ${err}`);
		setTimeout(start, 5000);
	}
}

start();

//----------------------------------------------------

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