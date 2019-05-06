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

REMOTE_HOST=$(`route -nee | awk '{ print $2 }' | sed -n 3p`)
#xdebug.remote_host = $REMOTE_HOST

echo "zend_extension=xdebug.so
xdebug.remote_enable = 1
xdebug.remote_connect_back = 1
xdebug.remote_port = 9000
xdebug.max_nesting_level = 512
xdebug.remote_autostart = true
xdebug.remote_host = 10.0.2.2
xdebug.remote_log = /var/log/xdebug.log" > /etc/php/7.3/mods-available/xdebug.ini

# TODO:
# Update /etc/php/7.2/apache2/php.ini and change the line
# zend_extension = /usr/lib/php/20170718/xdebug.so
