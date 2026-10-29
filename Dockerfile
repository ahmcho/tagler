FROM php:8.4-cli

ARG APP_PORT=8000
ARG VITE_DEV_SERVER_PORT=5173

ENV APP_PORT=${APP_PORT}
ENV VITE_DEV_SERVER_PORT=${VITE_DEV_SERVER_PORT}

# System dependencies + Node + PHP extensions
RUN apt-get update && apt-get install -y \
        git \
        curl \
        wget \
        unzip \
        zip \
        libicu-dev \
        libonig-dev \
        libpq-dev \
        libssl-dev \
        libzip-dev \
        postgresql-client \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install -j$(nproc) pdo_pgsql pgsql mbstring bcmath pcntl zip intl \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY docker/php/local.ini /usr/local/etc/php/conf.d/local.ini

WORKDIR /var/www/app

COPY composer.json composer.lock* ./
RUN composer install --no-interaction --no-scripts --no-autoloader

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/framework/testing storage/logs bootstrap/cache
RUN composer dump-autoload --no-interaction

EXPOSE ${APP_PORT} ${VITE_DEV_SERVER_PORT}
