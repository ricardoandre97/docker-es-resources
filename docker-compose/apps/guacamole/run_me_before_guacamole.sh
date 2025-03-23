#!/bin/bash

echo "Creating guacamole init db"
docker run --rm guacamole/guacamole /opt/guacamole/bin/initdb.sh --mysql > conf/initdb.sql
