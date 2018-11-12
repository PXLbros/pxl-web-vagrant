#!/bin/bash

# Install PHP dependencies
apt-get -y install software-properties-common
add-apt-repository -y ppa:ondrej/apache2
add-apt-repository -y ppa:ondrej/php
apt-get update -y

PHP_VERSIONS=($VERSIONS)

for PHP_VERSION in "${PHP_VERSIONS[@]}"
do
    # Install PHP version and common extensions
    apt-get -y install \
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
        apt-get install php-dev libmcrypt-dev php-pear -y
        pecl channel-update pecl.php.net

        if ! pecl list | grep mcrypt
        then
            pecl install mcrypt-1.0.1
        fi

        # Add line to php.ini configuration file
        PHP_INI_FILE_PATH=/etc/php/$PHP_VERSION/fpm/php.ini

        if ! grep -q "extension=mcrypt.so" $PHP_INI_FILE_PATH; then
            echo -e "\nextension=mcrypt.so" >> $PHP_INI_FILE_PATH
        fi
    else
        apt-get -y install php${PHP_VERSION}-mcrypt
    fi
done

# Enable Apache Fast-CGI
if [ $APACHE = "true" ]
then
    a2enmod actions fastcgi alias proxy_fcgi
fi

# Fix FPM permissions
for PHP_VERSION in "${PHP_VERSIONS[@]}"
do
    chmod 666 /run/php/php${PHP_VERSION}-fpm.sock

    sed -i "s/user = www-data/user = vagrant/" /etc/php/${PHP_VERSION}/fpm/pool.d/www.conf
    sed -i "s/group = www-data/group = vagrant/" /etc/php/${PHP_VERSION}/fpm/pool.d/www.conf
    sed -i "s/listen\.owner.*/listen.owner = vagrant/" /etc/php/${PHP_VERSION}/fpm/pool.d/www.conf
    sed -i "s/listen\.group.*/listen.group = vagrant/" /etc/php/${PHP_VERSION}/fpm/pool.d/www.conf
    sed -i "s/;listen\.mode.*/listen.mode = 0666/" /etc/php/${PHP_VERSION}/fpm/pool.d/www.conf

    sed -i -r -e 's/error_reporting = E_ALL & ~E_DEPRECATED/error_reporting = E_ALL | E_STRICT/g' /etc/php/${PHP_VERSION}/fpm/php.ini
    sed -i -r -e 's/display_errors = Off/display_errors = On/g' /etc/php/${PHP_VERSION}/fpm/php.ini

    service php${PHP_VERSION}-fpm restart
done

# Restart Apache
if [ $APACHE = "true" ]
then
    service apache2 restart
fi
