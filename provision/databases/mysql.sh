#!/bin/bash

. /vagrant/provision/helpers.sh

title "mysql.sh"

MYSQL_CONFIG_PATH=/etc/mysql/mysql.conf.d/mysqld.cnf

MYSQL_ROOT_USER=root
MYSQL_ROOT_PASSWORD=root

export MYSQL_USER_NAME=vagrant
export MYSQL_USER_PASSWORD=vagrant

# Set root password
title "mysql.sh (Set root password)"

debconf-set-selections <<< "mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD"
debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD"

## Install MySQL
title "mysql.sh (Install)"

apt-get install -y mysql-server

# Create user
title "mysql.sh (Create Vagrant user)"

echo "CREATE USER IF NOT EXISTS '$MYSQL_USER_NAME'@'localhost' IDENTIFIED BY '$MYSQL_USER_PASSWORD';" | mysql -u $MYSQL_ROOT_USER --password="$MYSQL_ROOT_PASSWORD"
echo "CREATE USER IF NOT EXISTS '$MYSQL_USER_NAME'@'%' IDENTIFIED BY '$MYSQL_USER_PASSWORD';" | mysql -u $MYSQL_ROOT_USER --password="$MYSQL_ROOT_PASSWORD"
echo "GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER_NAME'@'localhost';" | mysql -u $MYSQL_ROOT_USER --password="$MYSQL_ROOT_PASSWORD"
echo "GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER_NAME'@'%';" | mysql -u $MYSQL_ROOT_USER --password="$MYSQL_ROOT_PASSWORD"
echo "FLUSH PRIVILEGES;" | mysql -u $MYSQL_ROOT_USER --password="$MYSQL_ROOT_PASSWORD"

# Enable remote connections
title "mysql.sh (Enable remote connections)"

sed -i 's/^bind-address/#bind-address/' $MYSQL_CONFIG_PATH
sed -i 's/^skip-external-locking/#skip-external-locking/' $MYSQL_CONFIG_PATH

# Restart MySQL
title "mysql.sh (Restart)"

service mysql restart
