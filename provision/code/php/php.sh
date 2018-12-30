#!/bin/bash

export LOG_FILE_PATH=code/php.log

. /vagrant/provision/helpers/include.sh

PHP_VERSIONS=($PHP_VERSIONS)

# Install PHP dependencies
title 'PHP'

highlight_text 'Install PHP dependencies...'

exec_command "apt-get -y install software-properties-common"
exec_command "add-apt-repository -y ppa:ondrej/apache2"
exec_command "add-apt-repository -y ppa:ondrej/php"
exec_command "apt-get update -y"

for PHP_VERSION in "${PHP_VERSIONS[@]}"
do
    highlight_text "Install PHP $PHP_VERSION..."

    # Install PHP version and common extensions
    exec_command apt-get -y install \
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

    if [ -x "$(command -v php$PHP_VERSION)" ];
    then
        # Install PHP mcrypt extension
        if [ "$PHP_VERSION" == "7.3" ] || [ "$PHP_VERSION" == "7.2" ]
        then
            exec_command 'apt-get install php-dev libmcrypt-dev php-pear -y'
            exec_command 'pecl channel-update pecl.php.net'

            if ! pecl list | grep mcrypt
            then
                exec_command 'pecl install mcrypt-1.0.1'
            fi

            # Add line to php.ini configuration file
            PHP_INI_FILE_PATH=/etc/php/$PHP_VERSION/fpm/php.ini

            if ! grep -q "extension=mcrypt.so" $PHP_INI_FILE_PATH; then
                exec_command "echo -e \"\nextension=mcrypt.so\" >> $PHP_INI_FILE_PATH"
            fi
        else
            exec_command apt-get -y install php${PHP_VERSION}-mcrypt
        fi
    fi
done

for PHP_VERSION in "${PHP_VERSIONS[@]}"
do
    if [ -x "$(command -v php$PHP_VERSION)" ];
    then
        highlight_text "Fix PHP $PHP_VERSION permissions..."

        PHP_WWW_CONF_FILE=/etc/php/${PHP_VERSION}/fpm/pool.d/www.conf
        PHP_INI_FILE=/etc/php/${PHP_VERSION}/fpm/php.ini

        # Update FPM permissions
        exec_command "chmod 666 /run/php/php${PHP_VERSION}-fpm.sock"

        # Change FPM user and group
        exec_command "sed -i \"s/user = www-data/user = vagrant/\" $PHP_WWW_CONF_FILE"
        exec_command "sed -i \"s/group = www-data/group = vagrant/\" $PHP_WWW_CONF_FILE"
        exec_command "sed -i \"s/listen\.owner.*/listen.owner = vagrant/\" $PHP_WWW_CONF_FILE"
        exec_command "sed -i \"s/listen\.group.*/listen.group = vagrant/\" $PHP_WWW_CONF_FILE"
        exec_command "sed -i \"s/;listen\.mode.*/listen.mode = 0666/\" $PHP_WWW_CONF_FILE"

        # Change PHP error reporting
        exec_command "sed -i -r -e 's/error_reporting=.*/error_reporting = E_ALL | E_STRICT/g' $PHP_INI_FILE"
        exec_command "sed -i -r -e 's/display_errors = Off/display_errors = On/g' $PHP_INI_FILE"

        # Restart PHP version
        highlight_text "Restart PHP $PHP_VERSION..."

        exec_command "service php${PHP_VERSION}-fpm restart"
    fi
done

if [ -x "$(command -v php)" ];
then
    # Restart Apache
    if [ $APACHE = "true" ]
    then
        highlight_text 'Restart Apache...'

        exec_command service apache2 restart
    fi

    # Download Composer
    highlight_text 'Install Composer...'

    exec_command 'curl -sS https://getcomposer.org/installer | php'

    if [ -e composer.phar ];
    then
        # Install Composer
        exec_command "sudo mv composer.phar /usr/local/bin/composer"
        exec_command "sudo mkdir -p /root/.composer"
        grep -q -F 'PATH="$PATH:$HOME/.composer/vendor/bin"' /home/vagrant/.profile || exec_command "echo -e '\nPATH=\"\$PATH:\$HOME/.composer/vendor/bin\"' >> /home/vagrant/.profile"
    else
        red_text 'Could not download Composer.'
    fi
fi