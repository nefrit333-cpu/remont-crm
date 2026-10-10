#!/usr/bin/env bash
set -euo pipefail

echo "Preparing Remont CRM demo deployment..."

php artisan config:clear
php artisan migrate --force

if [ "${RAILWAY_STORAGE_LINK:-false}" = "true" ]; then
    php artisan storage:link || true
fi

php artisan config:cache
php artisan view:cache

echo "Remont CRM demo deployment is ready."
