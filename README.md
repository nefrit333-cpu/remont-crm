# Remont CRM

Demo CRM для ремонтной компании: заявки, объекты, этапы работ, задачи, календарь, файлы, платежи, акты, комментарии, история событий и роли доступа.

Проект сделан как портфолио-пример fullstack-приложения на Laravel + Inertia + React. Данные в seed-файле вымышлены.

## Стек

- Laravel 13, PHP 8.3+
- Inertia.js, React, TypeScript
- Tailwind CSS
- Spatie Permission для ролей
- Laravel Sanctum
- SQLite для стабильного локального demo-запуска
- Laravel Sail + MySQL как опциональный Docker-вариант

## Demo-аккаунты

Пароль для всех аккаунтов: `password`.

| Роль | Email |
| --- | --- |
| Администратор | `admin@remont-crm.test` |
| Менеджер | `manager@remont-crm.test` |
| Прораб | `foreman@remont-crm.test` |
| Клиент | `client@remont-crm.test` |

На главной странице есть быстрые кнопки входа под каждую роль.

## Стабильный локальный запуск

Основной demo-режим проекта работает через SQLite. Он не требует Docker и подходит для локальной проверки портфолио-версии.

```powershell
cp .env.example .env
composer install
npm install
powershell -ExecutionPolicy Bypass -File scripts/refresh-demo.ps1
npm run build
powershell -ExecutionPolicy Bypass -File scripts/serve-local.ps1
```

После запуска приложение будет доступно на `http://127.0.0.1:8000`.

Если нужно только пересоздать demo-данные:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/refresh-demo.ps1
```

Если нужен другой порт:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/serve-local.ps1 -Port 8010
```

## Проверки

Локальные проверки без онлайн-аудитов:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-local.ps1
```

Скрипты сначала используют `php`, `composer` и `npm` из `PATH`. Если PHP/Composer не найдены, на этой Windows-машине они дополнительно ищут bundled tools Codex в `Documents/Codex`.

Полная проверка с онлайн-аудитами npm и Composer:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-local.ps1 -WithOnlineAudit
```

`composer audit` зависит от доступности `https://packagist.org/api/security-advisories/`. Если advisory API падает по timeout, это внешний блокер проверки безопасности Composer, а не ошибка локального запуска CRM.

UI дополнительно проверялся в браузере: demo-вход администратора, dashboard, список объектов, карточка объекта и мобильная ширина 390 px.

## Проверка Composer audit

Для быстрой проверки доступности advisory API и состояния `composer audit` есть read-only скрипт:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-composer-audit.ps1
```

Скрипт ничего не обновляет: он не запускает `composer update`, не меняет `composer.json` и `composer.lock`, не пишет в `vendor`.

Exit codes:

- `0` — advisory API доступен, `composer audit` чистый; можно готовить public release отдельным шагом.
- `1` — advisory API доступен, `composer audit` нашёл advisories; нужно переходить к точечному обновлению зависимостей.
- `2` — advisory API недоступен или timeout; нужно повторить позже и ничего не менять.
- `3` — ошибка локального окружения, например не найден PHP или Composer.

## Запуск через Sail

Sail/MySQL оставлен как опциональный путь для окружений, где доступен Docker.

```bash
cp .env.example .env
composer install
php artisan key:generate
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate:fresh --seed
npm install
npm run build
```

После запуска приложение будет доступно на `http://localhost`.

## Известный риск по Composer-аудиту

`npm audit --audit-level=high` проходит без найденных уязвимостей.

В одном из прогонов `composer audit --ignore-unreachable` на 4 октября 2026 года нашёл 19 advisories в 5 PHP-пакетах:

- `guzzlehttp/guzzle`
- `laravel/framework`
- `league/commonmark`
- `league/flysystem`
- `symfony/yaml`

Повторная проверка `composer audit --ignore-unreachable` в тот же день вернула `No security vulnerability advisories found`, но одновременно сообщила, что Packagist и advisory API недоступны. Такой результат считается неполным, поэтому риск пока не закрыт.

Обычный `composer audit`, `composer outdated --direct` и online-обновление зависимостей в текущем окружении периодически упираются в таймауты Packagist; `composer diagnose` также показывал timeout для HTTP/HTTPS-доступа к Packagist. Offline-диагностика по локальному кэшу показывает dev-версии локальных path-зависимостей и major-обновление `phpunit/phpunit`, но не даёт безопасного пути закрыть найденные ранее advisories. Локальные `packages/` поэтому остаются временным решением.

Для demo-проекта основной практический риск ниже, чем для production: приложение не публикует внешний API, не принимает пользовательский Markdown/YAML как доверенный контент и не развёрнуто наружу. Перед публичным deploy нужно повторить `composer audit`, обновить затронутые пакеты до безопасных версий и заново прогнать проверки.

## Ограничения demo

- Регистрация отключена; пользователи создаются seed-данными.
- Загрузка реальных файлов не реализована, раздел файлов показывает demo-записи.
- Внешние сервисы, платежные провайдеры и уведомления не подключены.
- Для стабильной сборки в этом окружении часть Composer-пакетов подключена как локальные `path`-repositories в `packages/`.
