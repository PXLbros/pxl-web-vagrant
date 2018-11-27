#!/bin/bash

BASH_PROFILE_CONTENTS="# Source ~/.bashrc\n
source ~/.bashrc\n
\n
# .bash_profile\n
alias edit_aliases='vim ~/.bash_profile'\n
alias refresh_aliases='source ~/.bash_profile'\n
\n
# Shortcuts\n
alias ..='cd ..'\n
alias cls='clear'\n
alias ls='ls -lGa --color=auto'\n
alias grep='grep --color=auto'\n
\n
# /etc/hosts\n
alias edit_hosts='sudo vim /etc/hosts'"

if [ "$APACHE" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}\n
\n
# Apache\n
alias start_apache='sudo service apache2 start'\n
alias restart_apache='sudo service apache2 restart'\n
alias stop_apache='sudo service apache2 stop'\n
alias reload_apache='sudo service apache2 reload'\n
alias apache_status='sudo service apache2 status'\n
alias edit_apache_conf='sudo vim /etc/apache2/apache2.conf'\n
alias apache_sites='cd /etc/apache2/sites-available'\n
alias create_apache_vhost='node /vagrant/provision/shell/scripts/create_apache_vhost.js'\n
alias delete_apache_vhost='node /vagrant/provision/shell/scripts/delete_apache_vhost.js'\n
alias edit_apache_vhost_conf='node /vagrant/provision/shell/scripts/edit_apache_vhost_conf.js'"
fi

if [ "$NGINX" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}\n
\n
# nginx\n
alias start_nginx='sudo service nginx start'\n
alias restart_nginx='sudo service nginx restart'\n
alias stop_nginx='sudo service nginx stop'\n
alias nginx_status='sudo service nginx status'\n
alias reload_nginx='sudo service nginx reload'\n
alias create_nginx_site='node /vagrant/provision/shell/scripts/create_nginx_site.js'\n
alias delete_nginx_site='node /vagrant/provision/shell/scripts/delete_nginx_site.js'\n
alias edit_nginx_site_conf='node /vagrant/provision/shell/scripts/edit_nginx_site_conf.js'"
fi

BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}\n
\n
# Databases\n
alias create_database='node /vagrant/provision/shell/scripts/create_database.js'\n
alias delete_database='node /vagrant/provision/shell/scripts/delete_database.js'"

if [ "$MYSQL" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# MySQL\n
alias start_mysql='sudo service mysql start'\n
alias stop_mysql='sudo service mysql stop'\n
alias restart_mysql='sudo service mysql restart'\n
alias mysql_status='sudo service mysql status'"
fi

if [ "$MONGODB" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}\n
\n
# MongoDB\n
alias start_mongodb='sudo service mongodb start'\n
alias stop_mongodb='sudo service mongodb stop'\n
alias restart_mongodb='sudo service mongodb restart'\n
alias mongodb_status='sudo service mysql status'"
fi

# Save .bash_profile
echo -e $BASH_PROFILE_CONTENTS > /home/vagrant/.bash_profile
