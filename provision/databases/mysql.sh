#!/bin/bash

export LOG_FILE_PATH=databases/mysql.log

. /vagrant/provision/helpers/include.sh

title 'MySQL'

MYSQL_CONFIG_PATH=/etc/mysql/mysql.conf.d/mysqld.cnf

MYSQL_ROOT_USER=root
MYSQL_ROOT_PASSWORD=root

MYSQL_USER_NAME=vagrant
MYSQL_USER_PASSWORD=vagrant

if ! grep -qF "MYSQL_USER_NAME" /home/vagrant/.bashrc
then
    exec_command "echo -e \"\nexport MYSQL_USER_NAME=$MYSQL_USER_NAME\nexport MYSQL_USER_PASSWORD=$MYSQL_USER_PASSWORD\" >> /home/vagrant/.bashrc"
fi

if [ ! -x "$(command -v mysql)" ]; # If MySQL isn't installed
then
    # Set root password
    highlight_text "Set MySQL root password..."

    exec_command debconf-set-selections <<< "mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD"
    exec_command debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD"

    ## Install MySQL
    highlight_text 'Install MySQL...'

    exec_command apt-get install -y mysql-server

    if [ -x "$(command -v mysql)" ];
    then
        # Create user
        highlight_text "Create MySQL Vagrant user..."

        exec_command "echo \"CREATE USER IF NOT EXISTS '$MYSQL_USER_NAME'@'localhost' IDENTIFIED BY '$MYSQL_USER_PASSWORD';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
        exec_command "echo \"CREATE USER IF NOT EXISTS '$MYSQL_USER_NAME'@'%' IDENTIFIED BY '$MYSQL_USER_PASSWORD';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
        exec_command "echo \"GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER_NAME'@'localhost';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
        exec_command "echo \"GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER_NAME'@'%';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
        exec_command "echo \"FLUSH PRIVILEGES;\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""

        # Enable remote connections
        highlight_text 'Enable remote connections to MySQL...'

        exec_command sed -i \'s/^bind-address/#bind-address/\' $MYSQL_CONFIG_PATH
        exec_command sed -i \'s/^skip-external-locking/#skip-external-locking/\' $MYSQL_CONFIG_PATH

        # Restart MySQL
        highlight_text 'Restart MySQL...'

        exec_command service mysql restart
    fi
else
    warning_text 'Already installed.'
fi
