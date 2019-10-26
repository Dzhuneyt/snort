#!/bin/sh
set -e

composer global require hirak/prestissimo || true
composer install --prefer-dist -o || true
chown www-data -R ./vendor

php artisan migrate

apache2-foreground
