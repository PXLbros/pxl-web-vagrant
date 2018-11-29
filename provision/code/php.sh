#!/bin/bash

. /vagrant/provision/helpers.sh

# Install PHP dependencies
title "php.sh (Install dependencies)"

apt-get -y install software-properties-common
add-apt-repository -y ppa:ondrej/apache2
add-apt-repository -y ppa:ondrej/php
apt-get update -y

PHP_VERSIONS=($VERSIONS)

for PHP_VERSION in "${PHP_VERSIONS[@]}"
do
    title "php.sh (Install PHP $PHP_VERSION)"

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

for PHP_VERSION in "${PHP_VERSIONS[@]}"
do
    title "php.sh (Fix PHP $PHP_VERSION permissions)"

    PHP_WWW_CONF_FILE=/etc/php/${PHP_VERSION}/fpm/pool.d/www.conf
    PHP_INI_FILE=/etc/php/${PHP_VERSION}/fpm/php.ini

    # Update FPM permissions
    chmod 666 /run/php/php${PHP_VERSION}-fpm.sock

    # Change FPM user and group
    sed -i "s/user = www-data/user = vagrant/" $PHP_WWW_CONF_FILE
    sed -i "s/group = www-data/group = vagrant/" $PHP_WWW_CONF_FILE
    sed -i "s/listen\.owner.*/listen.owner = vagrant/" $PHP_WWW_CONF_FILE
    sed -i "s/listen\.group.*/listen.group = vagrant/" $PHP_WWW_CONF_FILE
    sed -i "s/;listen\.mode.*/listen.mode = 0666/" $PHP_WWW_CONF_FILE

    # Change PHP error reporting
    sed -i -r -e 's/error_reporting=.*/error_reporting = E_ALL | E_STRICT/g' $PHP_INI_FILE
    sed -i -r -e 's/display_errors = Off/display_errors = On/g' $PHP_INI_FILE

    # Restart PHP version
    title "php.sh (Restart PHP $PHP_VERSION)"

    service php${PHP_VERSION}-fpm restart
done

# Restart Apache
if [ $APACHE = "true" ]
then
    title "php.sh (Restart Apache)"

    service apache2 restart
fi

# Download Composer
title "php.sh (Install Composer)"

curl -sS https://getcomposer.org/installer | php

if [ -e composer.phar ];
then
    # Install Composer
    sudo mv composer.phar /usr/local/bin/composer
    sudo mkdir -p /root/.composer
    grep -q -F 'PATH="$PATH:$HOME/.composer/vendor/bin"' $HOME/.profile || echo -e '\nPATH="$PATH:$HOME/.composer/vendor/bin"' >> $HOME/.profile
else
    red_text "Could not download Composer."
fi
