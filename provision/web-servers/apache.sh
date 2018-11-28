#!/bin/bash

. /vagrant/provision/helpers.sh

title "apache.sh"

export APACHE_PORT=$PORT

if ! grep -qF "export APACHE_PORT" $HOME/.bashrc
then
    echo -e "\nexport APACHE_PORT=$APACHE_PORT" >> $HOME/.bashrc
fi

# Install Apache
title "apache.sh (Install)"

sudo apt-get -y install apache2

# Enable Apache rewrite module
title "apache.sh (Enable rewrite module)"

sudo a2enmod rewrite

# Change Apache user
sudo sed -i s/www-data/vagrant/ /etc/apache2/envvars
source /etc/apache2/envvars

# Change web root directory user ownership
sudo chown -R vagrant:vagrant /var/www

# Make FastCGI module directory ahead of installation
sudo mkdir -p /var/lib/apache2/fastcgi
sudo chown vagrant:vagrant /var/lib/apache2/fastcgi

# Download FastCGI module
title "apache.sh (Download FastCGI module)"

wget http://mirrors.kernel.org/ubuntu/pool/multiverse/liba/libapache-mod-fastcgi/libapache2-mod-fastcgi_2.4.7~0910052141-1.2_amd64.deb
sudo dpkg -i libapache2-mod-fastcgi_2.4.7~0910052141-1.2_amd64.deb

# Install FastCGI module
title "apache.sh (Install FastCGI module)"

sudo apt-get -y install libapache2-mod-fastcgi

# Enable FastCGI module
title "apache.sh (Enable FastCGI module)"

sudo a2enmod actions fastcgi alias proxy_fcgi

# Give Vagrant permission to edit Apache site configuration files
sudo chown -R vagrant:vagrant /etc/apache2/sites-available

# Restart Apache
title "apache.sh (Restart)"

sudo service apache2 restart
