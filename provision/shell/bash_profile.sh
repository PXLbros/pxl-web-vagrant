#!/bin/bash

export LOG_FILE_PATH=shell/bash_profile.log

. /vagrant/provision/helpers/include.sh

SCRIPTS_DIR="/vagrant/scripts"
SCRIPTS_PROJECTS_DIR="$SCRIPTS_DIR/projects"

title "bash_profile"

BASH_PROFILE_CONTENTS="# Source ~/.bashrc
[[ -s \"$HOME/.bashrc\" ]] && source \"$HOME/.bashrc\"

# PXL Web Vagrant
alias backup='sudo node $SCRIPTS_DIR/pxl/backup.js'
alias restore='sudo node $SCRIPTS_DIR/pxl/restore.js'
alias upgrade='node $SCRIPTS_DIR/pxl/upgrade.js'
alias help='node $SCRIPTS_DIR/pxl/help.js'

# .bash_profile
alias edit_bash_profile='vim ~/.bash_profile'
alias source_bash_profile='source ~/.bash_profile'

# .bashrc
alias edit_bashrc='vim ~/.bashrc'
alias source_bashrc='source ~/.bashrc'

# Shortcuts
alias ..='cd ..'
alias cls='clear'
alias ls='ls -lGa --color=auto'
alias grep='grep --color=auto'

# /etc/hosts
alias edit_hosts='sudo vim /etc/hosts'

# Projects
alias create_project='node $SCRIPTS_PROJECTS_DIR/create_project.js'
alias edit_project_site_conf='node $SCRIPTS_PROJECTS_DIR/edit_project_site_conf.js'
alias enable_project_site_conf='node $SCRIPTS_PROJECTS_DIR/enable_project_site_conf.js'
alias disable_project_site_conf='node $SCRIPTS_PROJECTS_DIR/disable_project_site_conf.js'
alias delete_project='node $SCRIPTS_PROJECTS_DIR/delete_project.js'
alias install_project='node $SCRIPTS_PROJECTS_DIR/install_project.js'

# Git
alias git_repo_info='node $SCRIPTS_PROJECTS_DIR/git/git_repo_info.js'
"

if [ "$APACHE_ENABLED" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# Apache
alias start_apache='sudo systemctl start apache2'
alias restart_apache='sudo systemctl restart apache2'
alias stop_apache='sudo systemctl stop apache2'
alias reload_apache='sudo systemctl reload apache2'
alias apache_status='sudo systemctl status apache2'
alias edit_apache_conf='sudo vim /etc/apache2/apache2.conf'
alias edit_apache_site_conf='edit_project_site_conf --web-server=apache'
alias delete_apache_site_conf='delete_project_site_conf --web-server=apache'"
fi

if [ "$NGINX_ENABLED" == "true" ]
then
    BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# nginx
alias start_nginx='sudo service nginx start'
alias restart_nginx='sudo service nginx restart'
alias stop_nginx='sudo service nginx stop'
alias nginx_status='sudo service nginx status'
alias reload_nginx='sudo service nginx reload'
alias edit_nginx_conf='sudo vim /etc/nginx/nginx.conf'
alias edit_nginx_site_conf='edit_project_site_conf --web-server=nginx'
alias delete_nginx_site_conf='delete_project_site_conf --web-server=nginx'"
fi

BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# Databases
alias create_database='node $SCRIPTS_DIR/databases/create.js'
alias delete_database='node $SCRIPTS_DIR/databases/delete.js'"

if [ "$MYSQL_ENABLED" == "true" ]
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

# PHP
BASH_PROFILE_CONTENTS="${BASH_PROFILE_CONTENTS}

# PHP
alias edit_php56_conf='sudo vim /etc/php/5.6/fpm/php.ini'
alias edit_php70_conf='sudo vim /etc/php/7.0/fpm/php.ini'
alias edit_php71_conf='sudo vim /etc/php/7.1/fpm/php.ini'
alias edit_php72_conf='sudo vim /etc/php/7.2/fpm/php.ini'
alias edit_php73_conf='sudo vim /etc/php/7.3/fpm/php.ini'"

# Save .bash_profile
exec_command "echo -e \"$BASH_PROFILE_CONTENTS\" > $HOME/.bash_profile"
