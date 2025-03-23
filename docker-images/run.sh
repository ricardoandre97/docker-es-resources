#!/bin/bash

echo "Iniciando container..."
echo "INICIADO!!" > /var/www/html/ini.html
httpd -D FOREGROUND
