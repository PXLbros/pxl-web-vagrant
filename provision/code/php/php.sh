#!/bin/bash

export LOG_FILE_PATH=code/php.log

. /vagrant/provision/helpers/include.sh

PHP_VERSIONS=($PHP_VERSIONS)
PHP_COMMON_MODULES=(
    "fpm"
    "curl"
    "gd"
    "mbstring"
    "xml"
    "zip"
    "soap"
    "bcmath"
)
PHP_USER_MODULES=($PHP_USER_MODULES)

title "PHP"

# Install PHP dependencies
highlight_text "Install PHP dependencies..."
exec_command "apt-get -y install software-properties-common"
# exec_command "apt-get -y install python-software-properties"

# Add PHP 7 PPA
add_ppa ondrej/apache2 ondrej/php

exec_command "apt-get update -y"

for PHP_VERSION in "${PHP_VERSIONS[@]}"; do
    if [ -x "$(command -v php$PHP_VERSION)" ]; then
        highlight_text "PHP $PHP_VERSION already installed."
    else
        highlight_text "Install PHP $PHP_VERSION..."
        exec_command "apt-get -y install php$PHP_VERSION"

        if [ -x "$(command -v php$PHP_VERSION)" ]; then
            # Install common modules
            highlight_text "Install PHP $PHP_VERSION modules..."
            for PHP_COMMON_MODULE in "${PHP_COMMON_MODULES[@]}"; do
                exec_command "apt-get -y install php$PHP_VERSION-$PHP_COMMON_MODULE"
            done

            # Install PHP mcrypt extension
            if [ "$PHP_VERSION" == "7.3" ] || [ "$PHP_VERSION" == "7.2" ]; then
                # exec_command "apt-get install php-dev libmcrypt-dev php-pear -y"
                # exec_command "pecl channel-update pecl.php.net"

                # if [ "$PHP_VERSION" == "7.2" ]; then
                #     if ! pecl list | grep mcrypt; then
                #         exec_command "pecl install mcrypt-1.0.1"
                #     fi
                # fi

                # # Add line to php.ini configuration file
                # PHP_INI_FILE_PATH=/etc/php/$PHP_VERSION/fpm/php.ini

                # if ! grep -q "extension=mcrypt.so" $PHP_INI_FILE_PATH; then
                #     exec_command "echo -e \"\nextension=mcrypt.so\" >> $PHP_INI_FILE_PATH"
                # fi
                echo "TODO: PHP ${PHP_VERSION} mcrypt"
                line_break
            else
                exec_command "apt-get -y install php${PHP_VERSION}-mcrypt"
            fi

            # Install user modules
            if [[ ! -z $PHP_USER_MODULES ]]; then
                highlight_text "Install PHP $PHP_VERSION user modules..."

                PHP_USER_MODULES=($PHP_USER_MODULES)

                for PHP_USER_MODULE in "${PHP_USER_MODULES[@]}"; do
                    exec_command "apt-get install -y php$PHP_VERSION-$PHP_USER_MODULE"
                done
            fi
        fi
    fi
done

for PHP_VERSION in "${PHP_VERSIONS[@]}"; do
    if [ -x "$(command -v php$PHP_VERSION)" ]; then
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
        exec_command "sed -i 's/memory_limit = .*/memory_limit = '256M'/' $PHP_INI_FILE"
        exec_command "sed -i 's/post_max_size = .*/post_max_size = '72M'/' $PHP_INI_FILE"
        exec_command "sed -i 's/upload_max_filesize = .*/upload_max_filesize = '64M'/' $PHP_INI_FILE"
        exec_command "sed -i 's/max_file_uploads = .*/max_file_uploads = '20'/' $PHP_INI_FILE"

        # Enable Apache PHP configuration
        # if [ "$APACHE_ENABLED" == "true" ]; then
            # highlight_text "Enable PHP FPM Apache configuration..."
            # exec_command "sudo a2enconf php${PHP_VERSION}-fpm"
        # fi

        # Restart PHP version
        highlight_text "Restart PHP $PHP_VERSION..."

        exec_command "service php${PHP_VERSION}-fpm restart"
    fi
done

if [ -x "$(command -v php)" ]; then
    # Restart Apache
    if [ "$APACHE_ENABLED" == "true" ]; then
        highlight_text "Restart Apache..."
        exec_command "service apache2 restart"
    fi

    # Download Composer
    highlight_text "Install Composer..."
    exec_command "curl -sS https://getcomposer.org/installer | php"

    if [ -e composer.phar ]; then
        # Install Composer
        exec_command "sudo mv composer.phar /usr/local/bin/composer"
        exec_command "sudo mkdir -p /root/.composer"
        grep -q -F 'PATH="$PATH:$HOME/.composer/vendor/bin"' /home/vagrant/.profile || exec_command "echo -e '\nPATH=\"\$PATH:\$HOME/.composer/vendor/bin\"' >> /home/vagrant/.profile"
    else
        red_text "Could not download Composer."
    fi
fi

# Delete Apache home page if Apache is not installed
if [[ ! -x "$(command -v apache)" ]]; then
    DEFAULT_APACHE_HOME_PAGE_FILE=/var/www/html/index.html

    if [ -f $DEFAULT_APACHE_HOME_PAGE_FILE ]; then
        highlight_text "Delete default Apache home page file..."
        exec_command "sudo rm $DEFAULT_APACHE_HOME_PAGE_FILE"
    fi
fi
