#!/bin/bash

export LOG_FILE_PATH=/vagrant/logs/web-servers/nginx.log

. /vagrant/provision/helpers.sh

title 'NGINX'

export NGINX_PORT=$PORT

if [ "$NGINX_PORT" != "80" ];
then
    if ! grep -qF "export NGINX_PORT" /home/vagrant/.bashrc
    then
        debug_command "echo -e \"\nexport NGINX_PORT=$NGINX_PORT\" >> /home/vagrant/.bashrc"
    fi
fi

# Install NGINX
info_text 'Install NGINX...'

debug_command sudo apt-get install nginx -y

if [ -x "$(command -v nginx)" ];
then
    # Give Vagrant permission to edit NGINX site configuration files
    info_text 'Give Vagrant user permission to NGINX sites-available/ directory...'

    debug_command sudo chown -R vagrant:vagrant /etc/nginx/sites-available

    # Update port in default site
    if [ "$NGINX_PORT" != "80" ];
    then
        if [ ! -z "$PORT" ]
        then
            debug_command "sed -i \"s/80/$PORT/g\" /etc/nginx/sites-available/default"
        fi
    fi

    # Restart NGINX
    info_text 'Restart NGINX...'

    debug_command "sudo service nginx start"
fi
