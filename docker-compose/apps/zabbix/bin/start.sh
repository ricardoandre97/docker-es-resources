#!/bin/bash

# Start zabbix server

/usr/sbin/zabbix_server -c /etc/zabbix/zabbix_server.conf

# Start zabbix agent

/usr/sbin/zabbix_agentd

# Start httpd

apachectl -DFOREGROUND
