#!/bin/bash

. /vagrant/provision/helpers.sh

title 'Apache'

export APACHE_PORT=$PORT

if ! grep -qF "export APACHE_PORT" $HOME/.bashrc
then
    debug_command "echo -e \"\nexport APACHE_PORT=$APACHE_PORT\" >> $HOME/.bashrc"
fi

# Install Apache
info_text 'Install Apache...'

debug_command sudo apt-get -y install apache2

# Enable Apache rewrite module
info_text 'Enable rewrite module...'

debug_command sudo a2enmod rewrite

# Change Apache user
debug_command sudo sed -i s/www-data/vagrant/ /etc/apache2/envvars
debug_command source /etc/apache2/envvars

# Change web root directory user ownership
debug_command sudo chown -R vagrant:vagrant /var/www

# Make FastCGI module directory ahead of installation
debug_command sudo mkdir -p /var/lib/apache2/fastcgi
debug_command sudo chown vagrant:vagrant /var/lib/apache2/fastcgi

# Download FastCGI module
info_text 'Download FastCGI module...'

debug_command wget http://mirrors.kernel.org/ubuntu/pool/multiverse/liba/libapache-mod-fastcgi/libapache2-mod-fastcgi_2.4.7~0910052141-1.2_amd64.deb
debug_command sudo dpkg -i libapache2-mod-fastcgi_2.4.7~0910052141-1.2_amd64.deb

# Install FastCGI module
info_text 'Install FastCGI module...'

debug_command sudo apt-get -y install libapache2-mod-fastcgi

# Enable FastCGI module
info_text 'Enable FastCGI module...'

debug_command sudo a2enmod actions fastcgi alias proxy_fcgi

# Give Vagrant permission to edit Apache site configuration files
debug_command sudo chown -R vagrant:vagrant /etc/apache2/sites-available

# Restart Apache
info_text 'Restart Apache...'

debug_command sudo service apache2 restart
