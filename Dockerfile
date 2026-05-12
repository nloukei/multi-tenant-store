# Stage 1: Build Assets
FROM node:20-alpine AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Install PHP Dependencies
FROM composer:2 AS composer-builder
WORKDIR /app
COPY composer*.json ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader
COPY . .
RUN composer dump-autoload --no-dev --optimize-autoloader

# Stage 3: Final Image
FROM php:8.3-fpm-alpine

# Install System Dependencies
RUN apk add --no-cache \
    nginx \
    postgresql-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    icu-dev \
    oniguruma-dev \
    dos2unix

# Install PHP Extensions
RUN docker-php-ext-install \
    pdo_pgsql \
    bcmath \
    gd \
    zip \
    intl \
    opcache \
    pcntl

# Configure Nginx
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Set Working Directory
WORKDIR /var/www/html

# Copy Application from builders
COPY --from=composer-builder /app .
COPY --from=node-builder /app/public/build ./public/build

# Set Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Copy and Fix Entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN dos2unix /usr/local/bin/entrypoint.sh && chmod +x /usr/local/bin/entrypoint.sh

# Expose Port
EXPOSE 80

# Set Entrypoint
ENTRYPOINT ["entrypoint.sh"]
