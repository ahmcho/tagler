#!/bin/sh
set -e

echo "Running database migrations..."
php artisan migrate --force

if grep -q '^APP_KEY=$' /var/www/app/.env 2>/dev/null; then
    echo "Generating Laravel application key..."
    php artisan key:generate --force
fi

trap 'kill -TERM $PHP_PID $VITE_PID 2>/dev/null' TERM INT

php artisan serve --host=0.0.0.0 --port="${APP_PORT:-8000}" &
PHP_PID=$!

npm run dev -- --host &
VITE_PID=$!

wait $PHP_PID $VITE_PID
