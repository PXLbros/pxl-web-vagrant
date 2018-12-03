#!/bin/bash

export LOG_FILE_PATH=/vagrant/logs/databases/mysql.log

. /vagrant/provision/helpers.sh

title 'MySQL'

MYSQL_CONFIG_PATH=/etc/mysql/mysql.conf.d/mysqld.cnf

MYSQL_ROOT_USER=root
MYSQL_ROOT_PASSWORD=root

MYSQL_USER_NAME=vagrant
MYSQL_USER_PASSWORD=vagrant

if ! grep -qF "MYSQL_USER_NAME" /home/vagrant/.bashrc
then
    debug_command "echo -e \"\nexport MYSQL_USER_NAME=$MYSQL_USER_NAME\nexport MYSQL_USER_PASSWORD=$MYSQL_USER_PASSWORD\" >> /home/vagrant/.bashrc"
fi

# Set root password
info_text "Set MySQL root password to "$MYSQL_ROOT_PASSWORD"..."

debug_command debconf-set-selections <<< "mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD"
debug_command debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD"

## Install MySQL
info_text 'Install MySQL...'

debug_command apt-get install -y mysql-server

if [ -x "$(command -v mysql)" ];
then
    # Create user
    info_text 'Create MySQL Vagrant user...'

    debug_command "echo \"CREATE USER IF NOT EXISTS '$MYSQL_USER_NAME'@'localhost' IDENTIFIED BY '$MYSQL_USER_PASSWORD';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
    debug_command "echo \"CREATE USER IF NOT EXISTS '$MYSQL_USER_NAME'@'%' IDENTIFIED BY '$MYSQL_USER_PASSWORD';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
    debug_command "echo \"GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER_NAME'@'localhost';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
    debug_command "echo \"GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER_NAME'@'%';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
    debug_command "echo \"FLUSH PRIVILEGES;\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""

    # Enable remote connections
    info_text 'Enable remote connections to MySQL...'

    debug_command sed -i \'s/^bind-address/#bind-address/\' $MYSQL_CONFIG_PATH
    debug_command sed -i \'s/^skip-external-locking/#skip-external-locking/\' $MYSQL_CONFIG_PATH

    # Restart MySQL
    info_text 'Restart MySQL...'

    debug_command service mysql restart
fi
