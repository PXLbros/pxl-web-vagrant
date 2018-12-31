#!/bin/bash

export LOG_FILE_PATH=web-servers/apache.log

. /vagrant/provision/helpers/include.sh

title "Apache"

if ! grep -qF "export APACHE_PORT" $HOME/.bashrc; then
    exec_command "echo -e \"\nexport APACHE_PORT=$APACHE_PORT\" >> $HOME/.bashrc"
fi

# Install Apache
highlight_text "Install Apache..."
exec_command "sudo apt-get -y install apache2"

# Enable Apache rewrite module
highlight_text "Enable rewrite module..."
exec_command "sudo a2enmod rewrite"

# Change Apache user
exec_command "sudo sed -i s/www-data/vagrant/ /etc/apache2/envvars"
exec_command "source /etc/apache2/envvars"

# Change web root directory user ownership
exec_command "sudo chown -R vagrant:vagrant /var/www"

# Make FastCGI module directory ahead of installation
exec_command "sudo mkdir -p /var/lib/apache2/fastcgi"
exec_command "sudo chown vagrant:vagrant /var/lib/apache2/fastcgi"

# Download FastCGI module
highlight_text 'Download FastCGI module...'
exec_command "wget http://mirrors.kernel.org/ubuntu/pool/multiverse/liba/libapache-mod-fastcgi/libapache2-mod-fastcgi_2.4.7~0910052141-1.2_amd64.deb"
exec_command "sudo dpkg -i libapache2-mod-fastcgi_2.4.7~0910052141-1.2_amd64.deb"

# Install FastCGI module
highlight_text "Install FastCGI module..."
exec_command sudo apt-get -y install libapache2-mod-fastcgi

# Enable FastCGI module
highlight_text "Enable FastCGI module..."
exec_command "sudo a2enmod actions fastcgi alias proxy_fcgi"

# Clean up FastCGI
exec_command "rm libapache2-mod-fastcgi_2.4.7~0910052141-1.2_amd64.deb"

# Give Vagrant permission to edit Apache site configuration files
exec_command "sudo chown -R vagrant:vagrant /etc/apache2/sites-available"

highlight_text "Set log format..."
# Set access log format
# LogFormat "%t %h %r (%>s)\n%{User-Agent}i\n%{Referer}i\n" combined

# Set error log format
exec_command 'echo "ErrorLogFormat \"[%t] %M\"" | sudo tee --append /etc/apache2/apache2.cnf > /dev/null'

# Restart Apache
highlight_text "Restart Apache..."
exec_command "sudo service apache2 restart"
