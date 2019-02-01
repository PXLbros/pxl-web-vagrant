#!/bin/bash

export LOG_FILE_PATH=code/php/xdebug.log

. /vagrant/provision/helpers/include.sh

title "Xdebug"

# Install PHP Xdebug
highlight_text "Install PHP Xdebug..."
exec_command "apt-get install -y php-xdebug"

# Download
XDEBUG_VERSION_STR="xdebug-2.6.1"

exec_command "wget http://xdebug.org/files/$XDEBUG_VERSION_STR.tgz"
exec_command "tar -xvzf $XDEBUG_VERSION_STR.tgz"
exec_command "cd $XDEBUG_VERSION_STR"
exec_command "./configure && make"
exec_command "cp modules/xdebug.so /usr/lib/php/20170718"

# TODO:
# Update /etc/php/7.2/apache2/php.ini and change the line
# zend_extension = /usr/lib/php/20170718/xdebug.so
