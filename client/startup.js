const COOKIE_INFOES = 'sc_cookie_infoes';
const SERVER_URL = 'sc_server_url';

const cookieInfoes = [
	{ url: 'https://zakupki.kontur.ru', domain: 'kontur.ru', names: ['token', 'auth.check', 'device', 'ngtoken', 'portaluserid', 'auth.sid', '.AUTHZAKUPKI', 'testcookie'] },
	{ url: 'http://localhost:58674', domain: 'localhost', names: ['testcookie'] }
]
setInLocalStorageAsync(COOKIE_INFOES, cookieInfoes);
setInLocalStorageAsync(SERVER_URL, 'http://localhost:58674');

//const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiNTQwNTdmY2MtZDFmMi00Mzk1LTgzZjAtNTI1YzE5NGFiM2JmIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiVVNFUiIsIkxJRkVUSU1FIjoiMTYyMDcyOTQ5NCIsImlzcyI6Ik15QXV0aFNlcnZlciIsImF1ZCI6Ik15QXV0aENsaWVudCJ9.GioH8LkTxLBrIoVuW_BY9Rm8gtvwxscZ5Jskn__6Ywc';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiY2ZkMWIzMGMtYzMwYi00Y2RiLTkwN2MtZjE3NTNjZWRlYjQwIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiVVNFUiIsIkxJRkVUSU1FIjoiMTYyMDcyOTUzNSIsImlzcyI6Ik15QXV0aFNlcnZlciIsImF1ZCI6Ik15QXV0aENsaWVudCJ9.FEHSlDgE-qVMu_PLKnCgjxHbixTfKGjlj__Q634Kox4';

//----------------------------------------------------

let connection;

async function initialSignalR() {
	const serverAddress = await getFromLocalStorageAsync(SERVER_URL);

	connection = new signalR.HubConnectionBuilder()
	    //.withUrl(serverAddress + "/hubs/cookie") // рабочая версия
	    .withUrl(serverAddress + "/hubs/cookie", { accessTokenFactory: () => TEST_TOKEN }) // с приминением jwt
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

	console.log('Конфигурация для соединения по сокетам выполнена');
}

async function start() {
	try {
		await connection.start();
		console.log('Соединение с сервером установлено');
	} catch (err) {
		console.log(`Не удалось установить соединение с сервером | err: ${err}`);
		//setTimeout(start, 5000);
	}
}

//initialSignalR();

initialSignalR().then(() => start());

//start();

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