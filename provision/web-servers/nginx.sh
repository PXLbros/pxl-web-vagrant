#!/bin/bash

export NGINX_PORT=$PORT

if ! grep -qF "export NGINX_PORT" /home/vagrant/.bashrc
then
    echo -e "\nexport NGINX_PORT=$NGINX_PORT" >> /home/vagrant/.bashrc
fi

# Install NGINX
sudo apt-get install nginx -y

# Give Vagrant permission to edit NGINX site configuration files
sudo chown -R vagrant:vagrant /etc/nginx/sites-available

# Update port in default site
if [ ! -z "$PORT" ]
then
    sed -i "s/80/$PORT/g" /etc/nginx/sites-available/default
fi

# Start NGINX
sudo service nginx start
