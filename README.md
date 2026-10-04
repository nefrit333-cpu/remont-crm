# Remont CRM

Demo CRM для ремонтной компании: заявки, объекты, этапы работ, задачи, календарь, файлы, платежи, акты, комментарии, история событий и роли доступа.

Проект сделан как портфолио-пример fullstack-приложения на Laravel + Inertia + React. Данные в seed-файле вымышлены.

## Стек

- Laravel 13, PHP 8.3+
- Inertia.js, React, TypeScript
- Tailwind CSS
- Spatie Permission для ролей
- Laravel Sanctum
- Laravel Sail + MySQL для Docker-запуска

## Demo-аккаунты

Пароль для всех аккаунтов: `password`.

| Роль | Email |
| --- | --- |
| Администратор | `admin@remont-crm.test` |
| Менеджер | `manager@remont-crm.test` |
| Прораб | `foreman@remont-crm.test` |
| Клиент | `client@remont-crm.test` |

На главной странице есть быстрые кнопки входа под каждую роль.

## Запуск через Sail

Нужен Docker.

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

## Локальный запуск без Docker

В этом окружении Docker CLI недоступен, поэтому проверка выполнялась через SQLite и локальный PHP:

```bash
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
DB_CONNECTION=sqlite DB_DATABASE="$(pwd)/database/database.sqlite" php artisan migrate:fresh --seed
npm install
npm run build
DB_CONNECTION=sqlite DB_DATABASE="$(pwd)/database/database.sqlite" php artisan serve
```

На Windows используйте абсолютный путь к `database/database.sqlite` вместо `$(pwd)`.

## Проверки

```bash
composer validate --no-check-publish
php artisan migrate:fresh --seed
php artisan test
vendor/bin/pint --test app bootstrap/app.php config database routes tests
npm run build
```

UI дополнительно проверялся в браузере: demo-вход администратора, dashboard, список объектов, карточка объекта и мобильная ширина 390 px.

## Известный риск по Composer-аудиту

`npm audit --audit-level=high` проходит без найденных уязвимостей.

`composer audit --ignore-unreachable` на 4 октября 2026 года нашёл 19 advisories в 5 PHP-пакетах:

- `guzzlehttp/guzzle`
- `laravel/framework`
- `league/commonmark`
- `league/flysystem`
- `symfony/yaml`

Обычный `composer audit`, `composer outdated --direct` и online-обновление зависимостей в текущем окружении упираются в таймауты Packagist. Offline-обновление по локальному кэшу не изменило `composer.lock`, поэтому риск пока не закрыт.

Для demo-проекта основной практический риск ниже, чем для production: приложение не публикует внешний API, не принимает пользовательский Markdown/YAML как доверенный контент и не развёрнуто наружу. Перед публичным deploy нужно повторить `composer audit`, обновить затронутые пакеты до безопасных версий и заново прогнать проверки.

## Ограничения demo

- Регистрация отключена; пользователи создаются seed-данными.
- Загрузка реальных файлов не реализована, раздел файлов показывает demo-записи.
- Внешние сервисы, платежные провайдеры и уведомления не подключены.
- Для стабильной сборки в этом окружении часть Composer-пакетов подключена как локальные `path`-repositories в `packages/`.
