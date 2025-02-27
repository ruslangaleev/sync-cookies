// URL нашего сервера
const serverUrl = 'http://ruslan.featureddata.com';

// Токен пользователя
const userToken = "";

// В проект уже добавлена библиотека SignalR...

// URL нашего SignalR хаба
const signalRHubUrl = `${serverUrl}/signalr-hub`;

async function initializeSignalR() {
  console.log('Начало инициализации SignalR');

  // Создаем подключение к хабу SignalR
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(signalRHubUrl, {
      accessTokenFactory: () => {
        // Верните ваш JWT токен
        return userToken;
      }
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000, 60000, 120000, 300000, 600000 ]) // Попытки переподключения через 0, 2, 5, 10, 30, 60 секунд, 2 минуты, 5 минут, 10 минут
    .build();

  connection.onreconnecting(async (error) => {
    console.warn(`Попытка переподключения`);

    // const body = JSON.stringify({
    //   message: "Попытка переподключения",
    //   payload: error
    // });

    // const response = await fetch(`${serverUrl}/api/logging/error`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${userToken}`
    //   },
    //   body: body
    // });

    // if (response.status === 400) {
    //   const errorText = await response.text();
    //   console.error(`Ошибка 400: ${errorText}`);
    // } else if (!response.ok) {
    //   throw new Error(`Ошибка! Статус: ${response.status}`);
    // }
  });
  
  connection.onreconnected(async (connectionId) => {
    console.log(`Соединение восстановлено`, connectionId);

    // const body = JSON.stringify({
    //   message: "Соединение восстановлено",
    //   payload: connectionId
    // });

    // const response = await fetch(`${serverUrl}/api/logging/info`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${userToken}`
    //   },
    //   body: body
    // });

    // if (response.status === 400) {
    //   const errorText = await response.text();
    //   console.error(`Ошибка 400: ${errorText}`);
    // } else if (!response.ok) {
    //   throw new Error(`Ошибка! Статус: ${response.status}`);
    // }
  });
  
  connection.onclose(async (error) => {
    console.error(`Соединение закрыто. Попробуем переподключиться позже`, error);

    // const body = JSON.stringify({
    //   message: "Соединение закрыто. Попробуем переподключиться позже",
    //   payload: error
    // });

    // const response = await fetch(`${serverUrl}/api/logging/error`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${userToken}`
    //   },
    //   body: body
    // });

    // if (response.status === 400) {
    //   const errorText = await response.text();
    //   console.error(`Ошибка 400: ${errorText}`);
    // } else if (!response.ok) {
    //   throw new Error(`Ошибка! Статус: ${response.status}`);
    // }
  });

  connection.on('ReceiveCookieUpdate', async (inputCookieUpdate) => {
    let cookieUpdate = JSON.parse(inputCookieUpdate);

    let serverCookie = null;
    try {
      serverCookie = JSON.parse(cookieUpdate.cookieJson);
    } catch (error) {
      console.error('Не удалось десериализовать cookieUpdate.cookieJson', error);
    }

    // Создаем ключ для хранения куки в localStorage
    let cookieKey = `${serverCookie.domain}_${serverCookie.name}`;


    // Извлекаем текущее значение куки из localStorage
    let storedCookie = JSON.parse(localStorage.getItem(cookieKey) || '{}');

    // в storedCookieValue будет лежать объект:
    // {
    //   "domain": "...",
    //   "name": "...",
    //   "value": "..."
    // }

    // Проверяем, отличается ли значение, пришедшее от сервера с значением в localStorage
    if (storedCookie.value !== serverCookie.value) {
      // Обновляем куку в браузере
      try {
        chrome.cookies.set({
          domain: serverCookie.domain,
          expirationDate: serverCookie.expirationDate,
          //hostOnly: serverCookie.hostOnly, << РУГАЕТСЯ
          httpOnly: serverCookie.httpOnly,
          name: serverCookie.name,
          path: serverCookie.path || '/', 
          sameSite: serverCookie.sameSite || 'Lax',
          secure: serverCookie.secure || false,
          //session: serverCookie.session, << РУГАЕТСЯ
          storeId: serverCookie.storeId,
          value: serverCookie.value,
          url: 'https://zakupki.kontur.ru'
        }, (cookie => {
          if (chrome.runtime.lastError) {
            console.error('Ошибка при установке кука в браузере:', chrome.runtime.lastError);
          } else {
            console.log('Кука успешно обновлена в браузере:', cookie);
          }
        }));
      } catch (error) {
        console.error(`chrome.cookies.set`, error);
      }

      const cookieToStore = {
        id: cookieUpdate.id,
        cookie: serverCookie
      };

      // Обновляем значение куки в localStorage
      localStorage.setItem(cookieKey, JSON.stringify(cookieToStore));
      console.log(`Обновлено значение кука ${serverCookie.name} для домена ${serverCookie.domain} из SignalR`);
    }
  });

  try {
    // Подключаемся к хабу SignalR
    await connection.start();
    console.log('Подключение к SignalR успешно установлено.');

    // const body = JSON.stringify({
    //   message: "Подключение к SignalR успешно установлено",
    //   payload: error
    // });

    // const response = await fetch(`${serverUrl}/api/logging/info`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${userToken}`
    //   },
    //   body: body
    // });

    // if (response.status === 400) {
    //   const errorText = await response.text();
    //   console.error(`Ошибка 400: ${errorText}`);
    // } else if (!response.ok) {
    //   throw new Error(`Ошибка! Статус: ${response.status}`);
    // }    
  } catch (error) {
    console.error('Ошибка при подключении к SignalR:', error);

    // const body = JSON.stringify({
    //   message: "Ошибка при подключении к SignalR",
    //   payload: error
    // });

    // const response = await fetch(`${serverUrl}/api/logging/error`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${userToken}`
    //   },
    //   body: body
    // });

    // if (response.status === 400) {
    //   const errorText = await response.text();
    //   console.error(`Ошибка 400: ${errorText}`);
    // } else if (!response.ok) {
    //   throw new Error(`Ошибка! Статус: ${response.status}`);
    // }    
  }
}

// Инициализация расширения при запуске
async function initializeExtension() {
  try {
    // Запрашиваем список ресурсов, доменов и куков с API
    let response = await fetch(`${serverUrl}/api/resources`, {
      method: 'GET', // или другой метод, который вам нужен (POST, PUT и т.д.)
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}` // Добавляем токен в заголовок
      }          
    });
    let data = await response.json();
    console.log("Список ресурсов при инициализации", data);

    // Пример структуры ответа. Структура которая нужна для того чтобы сверять и допускать какие куки надо обновлять
    // {
    //   "resources": [
    //     {
    //       "domains": [".mysite", "work.mysite.ru"],
    //       "cookies": ["ngtoken", "auth.sid"]
    //     }
    //   ]
    // }

    // Сохраняем ресурсы в localStorage
    localStorage.setItem('resources', JSON.stringify(data));
    console.log('Шаблоны доменов и кук успешно сохранены в localStorage');
  } catch (error) {
    console.error('Ошибка при инициализации шаблонов домен и кук:', error);
  }

  try {
    // Запрашиваем список куков с API
    let response = await fetch(`${serverUrl}/api/cookies`, {
      method: 'GET', // или другой метод, который вам нужен (POST, PUT и т.д.)
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` // Добавляем токен в заголовок
      }      
    });
    let data = await response.json();

    if (data.cookies.length === 0) {
      console.log("Коллекция куков пустая", data);
      return;
    }

    // Пример ответа, в котором содержится куки которые необходимо установить в браузер
    // Здесь даже без разницы для какого сайта
    // {
    //   "cookies": [
    //     { cookieId: 1, cookieJson: "\"domain\": \".mysite.ru\", \"name\": \"auth.sid\", \"secure\": false" },
    //     { cookieId: 2, cookieJson: "\"domain\": \"work.mysite.ru\", \"name\": \"auth.sid\", \"secure\": false" },
    //     { cookieId: 3, cookieJson: "\"domain\": \"live.mysite.ru\", \"name\": \"auth.sid\", \"secure\": false" }
    //   ]
    // }

    data.cookies.forEach(cookieEntry => {
      console.log(`cookieEntry`, cookieEntry);
      // Достаем куки данные
      let cookie = JSON.parse(cookieEntry.cookieJson);
      console.log(`cookie`, cookie);

      // Создаем ключ для хранения куки в localStorage в формате "<domain>_<name>"
      const cookieKey = `${cookie.domain}_${cookie.name}`;

      // Создаем объект для сохранения в localStorage
      const cookieToStore = {
        id: cookieEntry.id,
        cookie: cookie
      };

      // записываем куку в localStorage вместе с cookieId и cookieJson
      localStorage.setItem(cookieKey, JSON.stringify(cookieToStore));
      console.log(`Кука ${cookie.name} для домена ${cookie.domain} сохранена в localStorage`);

      try {
        // Устанавливаем куку в браузер
        chrome.cookies.set({
          domain: cookie.domain,
          expirationDate: cookie.expirationDate,
          // hostOnly: cookie.hostOnly,
          httpOnly: cookie.httpOnly,
          name: cookie.name,
          path: cookie.path,
          sameSite: cookie.sameSite,
          secure: cookie.secure,
          // session: cookie.session,
          storeId: cookie.storeId,
          value: cookie.value,
          url: 'https://zakupki.kontur.ru'
        }, (result) => {
          if (chrome.runtime.lastError) {
            console.error(`Ошибка при установке кука ${cookie.name} для домена ${cookie.domain}:`, chrome.runtime.lastError);
          } else {
            console.log(`Кука ${cookie.name} для домена ${cookie.domain} успешно установлена в браузере`)
          }
        });
      } catch (error) {
        
      }
    });
  } catch (error) {
    console.error('Ошибка при получении и обработке куков с API', error);
  }
}

// Слушатель событий изменения куков
chrome.cookies.onChanged.addListener(async (changeInfo) => {

  if (changeInfo.cookie.domain.includes("kontur.ru")) {
    if (changeInfo.removed) {
      return;
    }

    // Получаем текущее значение из localStorage
    const storedValue = localStorage.getItem("konturCookieValue");

    // Получаем новое значение куки
    const newValue = changeInfo.cookie.value;

    // Сравниваем новое значение с тем, что сохранено в localStorage
    if (storedValue !== newValue) {
        // Если значения отличаются, записываем новое значение в localStorage
        localStorage.setItem("konturCookieValue", newValue);

        // Выводим в консоль сообщение об изменении
        console.log(`Cookie value changed for domain ${changeInfo.cookie.domain}. Name: ${changeInfo.cookie.name}. New value: ${newValue}`);
    }
  } 

  return;
  let cookieName = changeInfo.cookie.name;
  let cookieDomain = changeInfo.cookie.domain;
  let cookieValue = changeInfo.cookie.value;

  let resourcesFromStorage = localStorage.getItem('resources');
  // Извлекаем список ресурсов из localStorage
  let resources = JSON.parse(resourcesFromStorage) || [];

  // Проверяем, совпадает ли домен куки с отслеживаемыми доменами
  let matchedResource = resources.find(resource =>
    resource.domains.includes(cookieDomain)
  );

  // Если домен не отслеживается, выходим
  if (!matchedResource) {
    return;
  }

  // Проверяем, отслеживается ли имя куки для найденного ресурса
  let matchedCookie = matchedResource.cookies.includes(cookieName);

  // Если кука не отслеживается, выходим
  if (!matchedCookie) {
    return;
  }

  if (changeInfo.removed) {
    return;
  }

  // Создаем ключ для хранения куки в формате "<домен>_<имя куки>"
  let cookieKey = `${cookieDomain}_${cookieName}`;

  // Извлекаем текущее значение куки из localStorage
  let cookieJson = localStorage.getItem(cookieKey);

  // Ожидаем объект, типа следующего формата JSON
  // Содержит cookieId (идентификатор) и cookie (объект куки)
  let storedCookie = JSON.parse(cookieJson);

  if (storedCookie) {
    // Если кука уже существует и значения совпадают, игнорируем изменение
    if (storedCookie.cookie) {
      if (storedCookie.cookie.value === cookieValue) {
        return;
      } 
    }
  }

  console.log(`storedCookie`, storedCookie);

  // Если значения отличаются или кука новая, обновляем localStorage и отправляем изменения на API
  try {
    // Отправляем обновленные данные кука на API

    // Пример данных, которые будем отправлять:
    // {
    //   "cookieId": 1,
    //   "name": "ngtoken",
    //   "cookieInfo": "{ "domain": ".mysite.ru", "name": "ngtoken", "secure": false, "hostOnly": true }"
    // }

    console.log('changeInfo.cookie', changeInfo.cookie);
    let body = JSON.stringify({
      id: storedCookie.id,
      cookieJson: JSON.stringify(changeInfo.cookie)
    });
    console.log('body', body);

    const response = await fetch(`${serverUrl}/api/cookies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: body
    });

    if (response.status === 400) {
      const errorText = await response.text();
      console.error(`Ошибка 400: ${errorText}`);
    } else if (!response.ok) {
      throw new Error(`Ошибка! Статус: ${response.status}`);
    } else {
      console.log(`Кука ${cookieName} успешно синхронизирована с API`, response);
    }

    // .then(response => {
    //   if (response.status === 400) {
    //     console.log(`Кука`); 
    //   } else {
    //     console.log(`Кука ${cookieName} успешно синхронизирована с API`, response);
    //   }
    // })
    // .catch(error => {
    //   console.error(`Ошибка при отправки кука на сервер:`, error);
    // });

    // console.log(`Кука ${cookieName} синхронизирована с API`);
  } catch (error) {
     console.error('Ошибка при обновлении кука и синхронизации с API:', error);

    // Если не удалось синхронизировать с API, то записывать в localStorage не нужно
    return;
  }

  let body = JSON.stringify({
    id: storedCookie.id,
    cookie: JSON.stringify(changeInfo.cookie)
  })
  // Обновляем только значение куки в localStorage
  console.log(`В localStorage сохраняем текущие куки`, body);
  localStorage.setItem(cookieKey, body);
  console.log(`Обновлено значение кука ${cookieName} для домена ${cookieDomain}`);
});

// Запускаем инициализацию расширения при загрузке
initializeExtension();
//initializeSignalR();