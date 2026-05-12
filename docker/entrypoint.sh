#!/bin/sh
set -e

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground
echo "Starting Nginx..."
nginx -g 'daemon off;'
