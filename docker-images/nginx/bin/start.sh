#!/bin/bash

# Starts php process in background

/usr/sbin/php-fpm -c /etc/php/fpm

# Starts nginx daemon

nginx -g 'daemon off;'

