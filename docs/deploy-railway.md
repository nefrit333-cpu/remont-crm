# Deploy demo на Railway

Этот документ описывает безопасный portfolio/demo deploy Remont CRM на Railway.
Проект остаётся demo-приложением: без production SLA, реальных CRM-интеграций, настоящих писем и уведомлений.

Официальный гайд Railway для Laravel: <https://docs.railway.com/guides/laravel>.

## Что Railway должен запустить

- Source: GitHub repo `nefrit333-cpu/remont-crm`.
- Branch: `master`.
- Builder: автоматический builder Railway для PHP/Laravel.
- База данных: PostgreSQL service в Railway.
- Health check path: `/up`.
- Pre-deploy command:

```bash
bash railway/deploy.sh
```

- Start command, если Railway не выставил его автоматически:

```bash
php artisan serve --host=0.0.0.0 --port=${PORT}
```

Скрипт `railway/deploy.sh` выполняет только безопасные действия для обычного deploy: очищает config cache, запускает миграции с `--force`, опционально создаёт storage symlink и пересобирает config/view cache.
Он не запускает seed и не пересоздаёт базу.

## Environment variables

Секреты задаются только в Railway Dashboard. Не добавляй их в `.env`, README или commit.

```dotenv
APP_NAME="Remont CRM"
APP_ENV=production
APP_DEBUG=false
APP_KEY=<сгенерировать локально: php artisan key:generate --show>
APP_URL=<Railway public URL после Generate Domain>
APP_LOCALE=ru
APP_FALLBACK_LOCALE=ru
APP_FAKER_LOCALE=ru_RU

LOG_CHANNEL=stderr
LOG_LEVEL=warning

DB_CONNECTION=pgsql
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_DATABASE=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_SSLMODE=prefer

SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_DOMAIN=null
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local

BROADCAST_CONNECTION=log
MAIL_MAILER=log
```

Redis для demo-окружения не нужен. Не добавляй в Railway переменные `REDIS_CLIENT`, `REDIS_HOST`, `REDIS_URL`, `REDIS_PASSWORD` и `REDIS_PORT`: при наличии Redis-переменных Railpack может попытаться установить PHP extension `redis`, хотя проект использует `CACHE_STORE=database` и `QUEUE_CONNECTION=database`.

Для PostgreSQL достаточно `DB_CONNECTION=pgsql` и переменных `DB_*` из блока выше. Если в Railway вручную задана переменная `RAILPACK_PHP_EXTENSIONS`, она не должна содержать `redis`; для этого demo её лучше оставить пустой/не заданной, либо указать только дополнительное расширение `pdo_pgsql`.

Если Railway создаёт переменную `DATABASE_URL`, можно использовать её вместо отдельных `DB_*`, но для читаемости demo-проекта лучше оставить явные переменные выше.

## Первый запуск demo-данных

Demo-аккаунты создаёт `DatabaseSeeder`. Seed не запускается автоматически при каждом deploy, чтобы случайно не стереть данные.
После первого успешного deploy можно один раз вручную пересоздать demo-базу в Railway shell или one-off command:

```bash
CONFIRM_REFRESH_DEMO=remont-crm-demo bash railway/refresh-demo.sh
```

Команда пересоздаёт базу и заполняет её вымышленными demo-данными. Использовать её только для portfolio/demo окружения.

Demo-аккаунты:

| Роль | Email | Пароль |
| --- | --- | --- |
| Администратор | `admin@remont-crm.test` | `password` |
| Менеджер | `manager@remont-crm.test` | `password` |
| Прораб | `foreman@remont-crm.test` | `password` |
| Клиент | `client@remont-crm.test` | `password` |

## Порядок deploy в Railway Dashboard

1. Создать новый Railway project.
2. Подключить GitHub repo `nefrit333-cpu/remont-crm`.
3. Добавить PostgreSQL service.
4. В service variables добавить переменные из раздела выше.
   Если Railway предложил переменные из старого `.env.example`, удалить Redis-переменные `REDIS_CLIENT`, `REDIS_HOST`, `REDIS_URL`, `REDIS_PASSWORD` и `REDIS_PORT`.
5. Указать pre-deploy command: `bash railway/deploy.sh`.
6. Убедиться, что start command задан автоматически; если нет, указать команду из раздела «Что Railway должен запустить».
7. В Networking нажать `Generate Domain`.
8. Обновить `APP_URL` на выданный Railway URL и redeploy.
9. Один раз выполнить `CONFIRM_REFRESH_DEMO=remont-crm-demo bash railway/refresh-demo.sh`.

## Проверка после deploy

- Открыть `/up`: должен вернуть успешный health response.
- Открыть главную страницу.
- Войти demo-аккаунтом администратора.
- Проверить dashboard, заявки, объекты и карточку объекта.
- Проверить мобильную ширину около 390 px.
- Посмотреть Railway logs: не должно быть критичных ошибок PHP, миграций, Vite assets или 500-ответов.

## Ограничения

- Это portfolio/demo deploy, не production-ready внедрение.
- Нет реальной отправки писем и уведомлений.
- Нет подключённых платежных провайдеров и внешней CRM-интеграции.
- Файлы в demo показываются как записи интерфейса; реальное пользовательское файловое хранилище не настраивалось.
- Платные ресурсы Railway включать только после отдельного подтверждения.
