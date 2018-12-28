#!/bin/bash

export LOG_FILE_PATH=/vagrant/logs/shell/bash_profile.log

. /vagrant/provision/helpers.sh

SHELL_DIR="/vagrant/provision/shell"

title 'bash_profile'

BASH_PROFILE_CONTENTS="# Source ~/.bashrc
[[ -s \"$HOME/.bashrc\" ]] && source \"$HOME/.bashrc\"

# .bash_profile
alias edit_bash_profile='vim ~/.bash_profile'
alias source_bash_profile='source ~/.bash_profile'

# .bashrc
alias edit_bashrc='vim ~/.bashrc'
alias source_bashrc='source ~/.bashrc'

# Shortcuts
alias menu='node $SHELL_DIR/scripts/menu.js'
alias ..='cd ..'
alias cls='clear'
alias ls='ls -lGah --color=auto'
alias grep='grep --color=auto'

# Menu
alias menu='node /vagrant/provision/shell/scripts/menu.js'

# Projects
alias create_project='node $SHELL_DIR/scripts/projects/create.js'
alias projects='node $SHELL_DIR/scripts/projects/find.js'

# Sites
alias create_site='node $SHELL_DIR/scripts/sites/create.js'
alias install_site='node $SHELL_DIR/scripts/sites/install.js'

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
alias create_apache_site='node $SHELL_DIR/scripts/web-servers/apache/create_site.js'
alias edit_apache_site='node $SHELL_DIR/scripts/web-servers/apache/edit_site.js'
alias delete_apache_site='node $SHELL_DIR/scripts/web-servers/apache/delete_site.js'"
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
alias create_nginx_site='node $SHELL_DIR/scripts/web-servers/nginx/create_site.js'
alias edit_nginx_site='node $SHELL_DIR/scripts/web-servers/nginx/edit_site.js'
alias delete_nginx_site='node $SHELL_DIR/scripts/web-servers/nginx/delete_site.js'"
fi

BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# Databases
alias create_database='node /vagrant/provision/shell/scripts/databases/create.js'
alias delete_database='node /vagrant/provision/shell/scripts/databases/delete.js'"

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
debug_command "echo -e \"$BASH_PROFILE_CONTENTS\" > $HOME/.bash_profile"

# Refresh .bash_profile
# debug_command "source $HOME/.bash_profile" // ISSUE: Doesn't source (out of terminal/shell/prompt))
