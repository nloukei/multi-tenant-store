#!/usr/bin/env bash
# exit on error
set -o errexit

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install JS dependencies and build frontend
npm install
npm run build

# Run migrations (force because it's production)
# Note: This will run on every deploy. 
# Ensure your DB credentials are set in Render environment variables first.
php artisan migrate --force
