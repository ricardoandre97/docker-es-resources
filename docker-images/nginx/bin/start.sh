#!/bin/bash

# Starts php process in background

mkdir -p /run/php-fpm && /usr/sbin/php-fpm -c /etc/php/fpm

# Starts nginx daemon

nginx -g 'daemon off;'
