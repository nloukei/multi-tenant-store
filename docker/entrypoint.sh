#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
max_retries=30
count=0
until php artisan db:monitor || [ $count -eq $max_retries ]; do
  >&2 echo "Database is unavailable - sleeping"
  sleep 2
  count=$((count + 1))
done

# Clear and Cache configuration/routes
echo "Caching configuration..."
php artisan package:discover --ansi
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
echo "Running migrations..."
php artisan migrate --force
php artisan tenants:migrate --force

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground
echo "Starting Nginx..."
nginx -g 'daemon off;'
