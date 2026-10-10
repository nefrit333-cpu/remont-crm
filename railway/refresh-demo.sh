#!/usr/bin/env bash
set -euo pipefail

if [ "${CONFIRM_REFRESH_DEMO:-}" != "remont-crm-demo" ]; then
    echo "This command recreates the demo database."
    echo "Set CONFIRM_REFRESH_DEMO=remont-crm-demo to run it intentionally."
    exit 1
fi

php artisan migrate:fresh --seed --force
php artisan config:clear
php artisan config:cache

echo "Remont CRM demo database was refreshed."
