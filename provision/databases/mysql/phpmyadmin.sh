#!/bin/bash

export LOG_FILE_PATH=databases/phpmyadmin.log

. /vagrant/provision/helpers/include.sh

title "phpMyAdmin"

exec_command "sudo apt-get update -y"
exec_command "sudo apt-get install -y phpmyadmin"

PHP_VERSIONS=($PHP_VERSIONS)

for PHP_VERSION in "${PHP_VERSIONS[@]}"; do
    exec_command "apt-get install -y php${PHP_VERSION}-mbstring php-${PHP_VERSION}gettext"
    exec_command "sudo php${PHP_VERSION}enmod mbstring"
    exec_command "sudo systemctl restart apache2"
done
