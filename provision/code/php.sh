#!/bin/bash

. /vagrant/provision/helpers.sh

# Install PHP dependencies
title 'PHP'

info_text 'Instal PHP dependencies...'

debug_command apt-get -y install software-properties-common
debug_command add-apt-repository -y ppa:ondrej/apache2
debug_command add-apt-repository -y ppa:ondrej/php
debug_command apt-get update -y

PHP_VERSIONS=($VERSIONS)

for PHP_VERSION in "${PHP_VERSIONS[@]}"
do
    info_text "Install PHP $PHP_VERSION..."

    # Install PHP version and common extensions
    debug_command apt-get -y install \
        php${PHP_VERSION} \
        php${PHP_VERSION}-fpm \
        php${PHP_VERSION}-curl \
        php${PHP_VERSION}-gd \
        php${PHP_VERSION}-mysql \
        php${PHP_VERSION}-mbstring \
        php${PHP_VERSION}-xml \
        php${PHP_VERSION}-zip \
        php${PHP_VERSION}-soap \
        php${PHP_VERSION}-bcmath

    # Install PHP mcrypt extension
    if [ "$PHP_VERSION" == "7.3" ] || [ "$PHP_VERSION" == "7.2" ]
    then
        debug_command apt-get install php-dev libmcrypt-dev php-pear -y
        debug_command pecl channel-update pecl.php.net

        if ! pecl list | grep mcrypt
        then
            debug_command pecl install mcrypt-1.0.1
        fi

        # Add line to php.ini configuration file
        PHP_INI_FILE_PATH=/etc/php/$PHP_VERSION/fpm/php.ini

        if ! grep -q "extension=mcrypt.so" $PHP_INI_FILE_PATH; then
            debug_command "echo -e \"\nextension=mcrypt.so\" >> $PHP_INI_FILE_PATH"
        fi
    else
        debug_command apt-get -y install php${PHP_VERSION}-mcrypt
    fi
done

for PHP_VERSION in "${PHP_VERSIONS[@]}"
do
    if [ -x "$(command -v php$PHP_VERSION)" ];
    then
        info_text "Fix PHP $PHP_VERSION permissions..."

        PHP_WWW_CONF_FILE=/etc/php/${PHP_VERSION}/fpm/pool.d/www.conf
        PHP_INI_FILE=/etc/php/${PHP_VERSION}/fpm/php.ini

        # Update FPM permissions
        debug_command chmod 666 /run/php/php${PHP_VERSION}-fpm.sock

        # Change FPM user and group
        debug_command sed -i "s/user = www-data/user = vagrant/" $PHP_WWW_CONF_FILE
        debug_command sed -i "s/group = www-data/group = vagrant/" $PHP_WWW_CONF_FILE
        debug_command sed -i "s/listen\.owner.*/listen.owner = vagrant/" $PHP_WWW_CONF_FILE
        debug_command sed -i "s/listen\.group.*/listen.group = vagrant/" $PHP_WWW_CONF_FILE
        debug_command sed -i "s/;listen\.mode.*/listen.mode = 0666/" $PHP_WWW_CONF_FILE

        # Change PHP error reporting
        debug_command sed -i -r -e 's/error_reporting=.*/error_reporting = E_ALL | E_STRICT/g' $PHP_INI_FILE
        debug_command sed -i -r -e 's/display_errors = Off/display_errors = On/g' $PHP_INI_FILE

        # Restart PHP version
        info_text "Restart PHP $PHP_VERSION..."

        debug_command service php${PHP_VERSION}-fpm restart
    fi
done

# Restart Apache
if [ $APACHE = "true" ]
then
    info_text 'Restart Apache...'

    debug_command service apache2 restart
fi

# Download Composer
info_text 'Install Composer...'

debug_command curl -sS https://getcomposer.org/installer | php

if [ -e composer.phar ];
then
    # Install Composer
    debug_command sudo mv composer.phar /usr/local/bin/composer
    debug_command sudo mkdir -p /root/.composer
    debug_command grep -q -F 'PATH="$PATH:$HOME/.composer/vendor/bin"' /home/vagrant/.profile || echo -e '\nPATH="$PATH:$HOME/.composer/vendor/bin"' >> /home/vagrant/.profile
else
    red_text 'Could not download Composer.'
fi
