#!/bin/bash

export LOG_FILE_PATH=shell/bash_profile.log

. /vagrant/provision/helpers/include.sh

SCRIPTS_DIR="/vagrant/scripts"
SCRIPTS_SITES_DIR="$SCRIPTS_DIR/sites"

title "bash_profile"

BASH_PROFILE_CONTENTS="# Source ~/.bashrc
[[ -s \"$HOME/.bashrc\" ]] && source \"$HOME/.bashrc\"

# PXL Web vagrant
alias help='node $SCRIPTS_DIR/shell/help.js'

# .bash_profile
alias edit_bash_profile='vim ~/.bash_profile'
alias source_bash_profile='source ~/.bash_profile'

# .bashrc
alias edit_bashrc='vim ~/.bashrc'
alias source_bashrc='source ~/.bashrc'

# Shortcuts
alias ..='cd ..'
alias cls='clear'
alias ls='ls -lGah --color=auto'
alias grep='grep --color=auto'

# /etc/hosts
alias edit_hosts='sudo vim /etc/hosts'

# Sites
alias create_site='node $SCRIPTS_SITES_DIR/create_site.js'
alias edit_site_conf='node $SCRIPTS_SITES_DIR/edit_site_conf.js'
alias delete_site='node $SCRIPTS_SITES_DIR/delete_site.js'
alias install_site='node $SCRIPTS_SITES_DIR/install_site.js'"

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
alias create_apache_site='create_site --web-server=apache'
alias edit_apache_site_conf='edit_site_conf --web-server=apache'
alias delete_apache_site='delete_site --web-server=apache'"
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
alias edit_nginx_conf='sudo vim /etc/nginx/nginx.conf'
alias create_nginx_site='create_site --web-server=nginx'
alias edit_nginx_site_conf='edit_site_conf --web-server=nginx'
alias delete_nginx_site='delete_site --web-server=nginx'"
fi

BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# Databases
alias create_database='node $SCRIPTS_DIR/databases/create.js'
alias delete_database='node $SCRIPTS_DIR/databases/delete.js'"

if [ "$MYSQL" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# MySQL
alias start_mysql='sudo service mysql start'
alias stop_mysql='sudo service mysql stop'
alias restart_mysql='sudo service mysql restart'
alias mysql_status='sudo service mysql status'
alias create_mysql_database='create_database --driver=mysql'
alias delete_mysql_database='delete_database --driver=mysql'"
fi

if [ "$MONGODB" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# MongoDB
alias start_mongodb='sudo service mongodb start'
alias stop_mongodb='sudo service mongodb stop'
alias restart_mongodb='sudo service mongodb restart'
alias mongodb_status='sudo service mysql status'
alias create_mongodb_database='create_database --driver=mongodb'
alias delete_mongodb_database='delete_database --driver=mongodb'"
fi

# Save .bash_profile
exec_command "echo -e \"$BASH_PROFILE_CONTENTS\" > $HOME/.bash_profile"
