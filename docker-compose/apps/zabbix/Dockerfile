FROM centos:7

ENV ZABBIX_REPO http://repo.zabbix.com/zabbix/3.4/rhel/7/x86_64/zabbix-release-3.4-1.el7.centos.noarch.rpm

RUN                              \
  yum -y install $ZABBIX_REPO && \
  yum -y install                 \
     zabbix-get                  \
     zabbix-server-mysql         \
     zabbix-web-mysql            \
     zabbix-agent

EXPOSE 80 443

COPY ./bin/start.sh /start.sh

COPY ./conf/zabbix-http.conf /etc/httpd/conf.d/zabbix.conf

COPY ./conf/zabbix-server.conf  /etc/zabbix/zabbix_server.conf

COPY ./conf/zabbix-conf.conf /etc/zabbix/web/zabbix.conf.php

VOLUME /usr/share/zabbix /var/log/httpd

RUN chmod +x /start.sh

CMD /start.sh
