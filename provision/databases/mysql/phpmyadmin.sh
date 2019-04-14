#!/bin/bash

export LOG_FILE_PATH=databases/mysql/phpmyadmin.log

. /vagrant/provision/helpers/include.sh

title "phpMyAdmin"

PHPMYADMIN_ROOT_PASSWORD=vagrant

highlight_text "Configure..."
exec_command "sudo debconf-set-selections <<< 'phpmyadmin phpmyadmin/dbconfig-install boolean true'"
exec_command "sudo debconf-set-selections <<< 'phpmyadmin phpmyadmin/app-password-confirm password $PHPMYADMIN_ROOT_PASSWORD'"
exec_command "sudo debconf-set-selections <<< 'phpmyadmin phpmyadmin/mysql/admin-pass password $PHPMYADMIN_ROOT_PASSWORD'"
exec_command "sudo debconf-set-selections <<< 'phpmyadmin phpmyadmin/mysql/app-pass password $PHPMYADMIN_ROOT_PASSWORD'"
exec_command "sudo debconf-set-selections <<< 'phpmyadmin phpmyadmin/reconfigure-webserver multiselect none'"

highlight_text "Install..."
exec_command "sudo apt-get install -y phpmyadmin"

PHP_VERSIONS=($PHP_VERSIONS)

for PHP_VERSION in "${PHP_VERSIONS[@]}"; do
    exec_command "apt-get install -y php${PHP_VERSION}-mbstring php-${PHP_VERSION}gettext"
    exec_command "sudo php${PHP_VERSION}enmod mbstring"
    exec_command "sudo systemctl restart apache2"
done

# Create Apache Virtual Host
if [[ ! -x "$(command -v apache)" ]]; then
    echo "<VirtualHost *:80>
    DocumentRoot /usr/share/phpmyadmin

    <Directory />
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/phpmyadmin.log
    CustomLog ${APACHE_LOG_DIR}/phpmyadmin.log combined
</VirtualHost>" > /etc/apache2/sites-available/phpmyadmin.conf
fi
