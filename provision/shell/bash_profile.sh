#!/bin/bash

. /vagrant/provision/helpers.sh

title "bash_profile.sh"

BASH_PROFILE_CONTENTS="# Source ~/.bashrc
[[ -s \"$HOME/.bashrc\" ]] && source \"$HOME/.bashrc\"

# .bash_profile
alias edit_aliases='vim ~/.bash_profile'
alias refresh_aliases='source ~/.bash_profile'

# Shortcuts
alias ..='cd ..'
alias cls='clear'
alias ls='ls -lGa --color=auto'
alias grep='grep --color=auto'

# /etc/hosts
alias edit_hosts='sudo vim /etc/hosts'"

if [ "$APACHE" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# Apache
alias start_apache='sudo service apache2 start'
alias restart_apache='sudo service apache2 restart'
alias stop_apache='sudo service apache2 stop'
alias reload_apache='sudo service apache2 reload'
alias apache_status='sudo service apache2 status'
alias edit_apache_conf='sudo vim /etc/apache2/apache2.conf'
alias apache_sites='cd /etc/apache2/sites-available'
alias create_apache_vhost='node /vagrant/provision/shell/scripts/create_apache_vhost.js'
alias delete_apache_vhost='node /vagrant/provision/shell/scripts/delete_apache_vhost.js'
alias edit_apache_vhost_conf='node /vagrant/provision/shell/scripts/edit_apache_vhost_conf.js'"
fi

if [ "$NGINX" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# nginx
alias start_nginx='sudo service nginx start'
alias restart_nginx='sudo service nginx restart'
alias stop_nginx='sudo service nginx stop'
alias nginx_status='sudo service nginx status'
alias reload_nginx='sudo service nginx reload'
alias create_nginx_site='node /vagrant/provision/shell/scripts/create_nginx_site.js'
alias delete_nginx_site='node /vagrant/provision/shell/scripts/delete_nginx_site.js'
alias edit_nginx_site_conf='node /vagrant/provision/shell/scripts/edit_nginx_site_conf.js'"
fi

BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# Databases
alias create_database='node /vagrant/provision/shell/scripts/create_database.js'
alias delete_database='node /vagrant/provision/shell/scripts/delete_database.js'"

if [ "$MYSQL" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# MySQL
alias start_mysql='sudo service mysql start'
alias stop_mysql='sudo service mysql stop'
alias restart_mysql='sudo service mysql restart'
alias mysql_status='sudo service mysql status'"
fi

if [ "$MONGODB" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# MongoDB
alias start_mongodb='sudo service mongodb start'
alias stop_mongodb='sudo service mongodb stop'
alias restart_mongodb='sudo service mongodb restart'
alias mongodb_status='sudo service mysql status'"
fi

# Save .bash_profile
echo -e "$BASH_PROFILE_CONTENTS" > $HOME/.bash_profile

# Refresh .bash_profile
source $HOME/.bash_profile
