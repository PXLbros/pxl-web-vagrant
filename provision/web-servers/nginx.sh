#!/bin/bash

. /vagrant/provision/helpers.sh

title "nginx.sh"

export NGINX_PORT=$PORT

if ! grep -qF "export NGINX_PORT" $HOME/.bashrc
then
    echo -e "\nexport NGINX_PORT=$NGINX_PORT" >> $HOME/.bashrc
fi

# Install NGINX
title "nginx.sh (Install)"

sudo apt-get install nginx -y

# Give Vagrant permission to edit NGINX site configuration files
sudo chown -R vagrant:vagrant /etc/nginx/sites-available

# Update port in default site
if [ ! -z "$PORT" ]
then
    sed -i "s/80/$PORT/g" /etc/nginx/sites-available/default
fi

# Start NGINX
title "nginx.sh (Restart)"

sudo service nginx start
