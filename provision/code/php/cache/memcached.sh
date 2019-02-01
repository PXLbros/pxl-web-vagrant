#!/bin/bash

export LOG_FILE_PATH=code/php/cache/memcached.log

. /vagrant/provision/helpers/include.sh

title "Memcached"

if [[ ! -x "$(command -v php)" ]]; then
    warning_text "PHP not installed."
fi

MEMCACHED_CONFIG_FILE_PATH=/etc/memcached.conf

# Install Memcached
highlight_text "Install Memcached..."
exec_command "sudo apt-get install memcached"

# Configure
# highlight_text "Configure Memcached..."
# exec_command "sudo apt-get install memcached"

# Install Memcached PHP extension
highlight_text "Install Memcached PHP extension..."
exec_command "apt-get install -y php-memcached"

# Restart Apache
if [ "$APACHE_ENABLED" == "true" ]; then
    highlight_text "Restart Apache..."
    exec_command "sudo service apache2 restart"
fi

# Restart NGINX
if [ "$NGINX_ENABLED" == "true" ]; then
    highlight_text "Restart NGINX..."
    exec_command "sudo service nginx restart"
fi
