FROM node:22-bookworm-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM composer:2 AS composer

FROM php:8.4-cli-bookworm
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libpq-dev unzip \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer /usr/bin/composer /usr/local/bin/composer
COPY . .
RUN COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader \
    && composer check-platform-reqs --no-dev
COPY --from=frontend /app/public/build ./public/build

CMD ["sh", "-c", "exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000} --no-reload"]
