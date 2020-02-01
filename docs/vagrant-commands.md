---
title: Vagrant Commands
---

# Commands

```shell
alias backup='sudo node /vagrant/scripts/pxl/backup.js'

alias restore='sudo node /vagrant/scripts/pxl/restore.js'

alias upgrade='node /vagrant/scripts/pxl/upgrade.js'

alias help='node /vagrant/scripts/pxl/help.js'
```

## .bash_profile
```shell
alias edit_bash_profile='vim ~/.bash_profile'

alias edit_bash_profile='vim ~/.bash_profile' aliassource_bash_profile='source ~/.bash_profile'
```

## .bashrc
```shell
alias edit_bashrc='vim ~/.bashrc'

alias edit_bashrc='vim ~/.bashrc' aliassource_bashrc='source ~/.bashrc'
```

## Shortcuts
```shell
alias ..='cd ..' alias cls='clear'

alias ls='ls -lGa --color=auto'

alias grep='grep --color=auto'

alias gh='history | grep '

alias last_modified_files='find ./ -type f -mtime -1'
```

## /etc/hosts
```shell
alias ..='cd ..'

alias cls='clear'

alias ls='ls -lGa --color=auto'

alias grep='grep --color=auto'

alias gh='history | grep '

alias last_modified_files='find ./ -type f -mtime -1'

alias edit_hosts='sudo vim /etc/hosts'
```

## Projects
```shell
alias projects='cd /vagrant/projects'

alias create_project='node /vagrant/scripts/projects/create_project.js'

alias enable_project_site_conf='node /vagrant/scripts/projects/enable_project_site_conf.js'

alias disable_project_site_conf='node /vagrant/scripts/projects/disable_project_site_conf.js'

alias delete_project='node /vagrant/scripts/projects/delete_project.js'

alias install_project='node /vagrant/scripts/projects/install_project.js'
```

## Web Servers
```shell
alias edit_site_conf='node /vagrant/scripts/web_servers/edit_site_conf.js'
```

## Apache
```shell
alias start_apache='sudo systemctl start apache2'

alias restart_apache='sudo systemctl restart apache2'

alias stop_apache='sudo systemctl stop apache2'

alias reload_apache='sudo systemctl reload apache2'

alias apache_status='sudo systemctl status apache2'

alias check_apache_config='sudo apache2ctl -t'

alias check_apache_vhost='sudo apache2ctl -S'

alias edit_apache_conf='sudo vim /etc/apache2/apache2.conf'

alias edit_apache_site_conf='edit_project_site_conf --web-server=apache'

alias delete_apache_site_conf='delete_project_site_conf --web-server=apache'
```

## Databases
```shell
alias create_database='node /vagrant/scripts/databases/create.js'

alias delete_database='node /vagrant/scripts/databases/delete.js'
```

## MySQL
```shell
alias start_mysql='sudo service mysql start'

alias stop_mysql='sudo service mysql stop'

alias restart_mysql='sudo service mysql restart'

alias mysql_status='sudo service mysql status'

alias create_mysql_database='create_database --driver=mysql'
```
