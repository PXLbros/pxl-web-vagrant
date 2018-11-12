#!/bin/bash

export APACHE_PORT=$PORT

if ! grep -qF "export APACHE_PORT" /home/vagrant/.bashrc
then
    echo -e "\nexport APACHE_PORT=$APACHE_PORT" >> /home/vagrant/.bashrc
fi

# Install Apache
sudo apt-get -y install apache2

# Enable Apache rewrite module
sudo a2enmod rewrite

# Change Apache user
sudo sed -i s/www-data/vagrant/ /etc/apache2/envvars
source /etc/apache2/envvars

# Change web root directory user ownership
sudo chown -R vagrant:vagrant /var/www

# Make Apache FastCGI module directory ahead of installation
sudo mkdir -p /var/lib/apache2/fastcgi
sudo chown vagrant:vagrant /var/lib/apache2/fastcgi

# Download and install Apache FastCGI module
wget http://mirrors.kernel.org/ubuntu/pool/multiverse/liba/libapache-mod-fastcgi/libapache2-mod-fastcgi_2.4.7~0910052141-1.2_amd64.deb
sudo dpkg -i libapache2-mod-fastcgi_2.4.7~0910052141-1.2_amd64.deb

# Install Apache FastCGI module
sudo apt-get -y install libapache2-mod-fastcgi

# Give Vagrant permission to edit Apache site configuration files
sudo chown -R vagrant:vagrant /etc/apache2/sites-available

# Restart Apache
sudo service apache2 restart
