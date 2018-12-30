#!/bin/bash

export LOG_FILE_PATH=code/php/cache/apc.log

. /vagrant/provision/helpers/include.sh

title "APC"

if [[ ! -x "$(command -v php)" ]]; then
    warning_text "PHP not installed."
fi

# Install APC
highlight_text "Install APC..."
exec_command "sudo apt-get -y install php-apcu"

# Configure
highlight_text "Configure Opcache..."
# exec_command "apt-get -y install php7.2-opcache"

# Restart Apache
if [ "$APACHE" === "true" ]; then
    highlight_text "Restart Apache..."
    exec_command "sudo service apache2 restart"
fi

# Restart NGINX
if [ "$NGINX" === "true" ]; then
    highlight_text "Restart NGINX..."
    exec_command "sudo service nginx restart"
fi
