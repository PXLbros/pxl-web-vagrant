#!/bin/bash

export LOG_FILE_PATH=cache/redis.log

. /vagrant/provision/helpers/include.sh

title "Redis"

REDIS_CONFIG_FILE_PATH=/etc/redis/redis.conf

# Install Redis
highlight_text "Install Redis..."
exec_command "sudo apt-get -y install redis-server"

# Enable Redis to start on boot...
highlight_text "Enable Redis to start on boot..."
exec_command "sudo systemctl enable redis-server.service"

# Configure Redis
# TODO: Set with sed:
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Restart Redis
highlight_text "Restart Redis..."
exec_command "sudo systemctl restart redis-server.service"

if [ "$PHP" == "true" ]; then
    # Install Redis PHP extension
    highlight_text "Install Redis PHP extension..."
    exec_command "sudo apt-get install php-redis"

    # Restart Apache
    if [ "$APACHE" == "true" ]; then
        highlight_text "Restart Apache"
        exec_command "sudo service apache2 restart"
    fi

    # Restart NGINX
    if [ "$NGINX" == "true" ]; then
        highlight_text "Restart NGINX"
        exec_command "sudo service nginx restart"
    fi
fi
