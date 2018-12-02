#!/bin/bash

. /vagrant/provision/helpers.sh

title 'NGINX'

export NGINX_PORT=$PORT

if ! grep -qF "export NGINX_PORT" $HOME/.bashrc
then
    debug_command echo -e "\nexport NGINX_PORT=$NGINX_PORT" >> $HOME/.bashrc
fi

# Install NGINX
info_text 'Install NGINX...'

debug_command sudo apt-get install nginx -y

# Give Vagrant permission to edit NGINX site configuration files
debug_command sudo chown -R vagrant:vagrant /etc/nginx/sites-available

# Update port in default site
if [ ! -z "$PORT" ]
then
    debug_command sed -i "s/80/$PORT/g" /etc/nginx/sites-available/default
fi

# Restart NGINX
info_text 'Restart NGINX...'

debug_command sudo service nginx start
