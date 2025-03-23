FROM fedora:41

RUN yum -y install httpd

COPY beryllium /var/www/html

CMD httpd -D FOREGROUND
