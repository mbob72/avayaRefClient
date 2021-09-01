# avayaRefClient
Архив приложения без заглушки проверки телефона [здесь](https://yadi.sk/d/0rHAb07C1S40Cg)

Чтобы совершить звонок, нужно в файле 

lib/oceana/OceanaCustomerWebVoiceVideo.js 

строку вида

var isValid = /^\+?(0|[1-9]\d*)$/.test(destination);


заменить на 

var isValid = true

А так же задать конфигурацию звонка.

В данном приложении сделана доработка которая устанавливает дефолтные настройки для звонка на продовский сервис

Код по этой доработке можно видеть [здесь](https://github.com/mbob72/avayaRefClient/commit/4b0177ba6bb1cee3add7de5fe52499db206ebe6f)

