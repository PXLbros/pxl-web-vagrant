#!/bin/bash

export LOG_FILE_PATH=databases/mysql.log

. /vagrant/provision/helpers/include.sh

title "MySQL"

MYSQL_CONFIG_PATH=/etc/mysql/mysql.conf.d/mysqld.cnf

MYSQL_ROOT_USER=root
MYSQL_ROOT_PASSWORD=root

MYSQL_USER_NAME=vagrant
MYSQL_USER_PASSWORD=vagrant

# MYSQL_VERSION="8"
MYSQL_VERSIONS=($MYSQL_VERSIONS)

if ! grep -qF "MYSQL_USER_NAME" /home/vagrant/.bashrc; then
    exec_command "echo -e \"\nexport MYSQL_USER_NAME=$MYSQL_USER_NAME\nexport MYSQL_USER_PASSWORD=$MYSQL_USER_PASSWORD\" >> /home/vagrant/.bashrc"
fi

for MYSQL_VERSION in "${MYSQL_VERSIONS[@]}"; do
    figlet "MySQL $MYSQL_VERSION"

    # Check if MySQL version is already installed
    # ...
    
    # Install
done

# # If MySQL isn't installed
# if [ ! -x "$(command -v mysql)" ]; then
#     # Set root password
#     highlight_text "Set MySQL root password..."

#     if [ "$MYSQL_VERSION" == "8" ]; then
#         MYSQL_DEB_PACKAGE_VERSION="0.8.12-1_all"

#         exec_command "wget -c https://dev.mysql.com/get/mysql-apt-config_$MYSQL_DEB_PACKAGE_VERSION.deb"
#         exec_command "dpkg -i mysql-apt-config_$MYSQL_DEB_PACKAGE_VERSION.deb"
#         exec_command "sed -i 's/mysql-5.7/mysql-8.0/g' /etc/apt/sources.list.d/mysql.list"
#         exec_command "rm -rf mysql-apt-config_$MYSQL_DEB_PACKAGE_VERSION.deb"
#         exec_command "apt-get update"
#         exec_command "apt-get install -y mysql-server"

#         exec_command "debconf-set-selections <<< \"mysql-server mysql-server/data-dir select ''\""
#     fi

#     exec_command "debconf-set-selections <<< \"mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD\""
#     exec_command "debconf-set-selections <<< \"mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD\""

#     ## Install MySQL
#     highlight_text "Install MySQL..."

#     if [ "$MYSQL_VERSION" == "5.5" ]; then
#         exec_command "apt-get install -y mysql-server-5.5"
#     elif [ "$MYSQL_VERSION" == "5.6" ]; then
#         exec_command "apt-get install -y mysql-server-5.6"
#     elif [ "$MYSQL_VERSION" == "5.7" ]; then
#         exec_command "apt-get install -y mysql-server"
#     fi

#     if [ -x "$(command -v mysql)" ];
#     then
#         # Create user
#         highlight_text "Create MySQL Vagrant user..."

#         exec_command "echo \"CREATE USER IF NOT EXISTS '$MYSQL_USER_NAME'@'localhost' IDENTIFIED BY '$MYSQL_USER_PASSWORD';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
#         exec_command "echo \"CREATE USER IF NOT EXISTS '$MYSQL_USER_NAME'@'%' IDENTIFIED BY '$MYSQL_USER_PASSWORD';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
        
#         if [ "$MYSQL_VERSION" == "8" ]; then
#             exec_command "ALTER USER '$MYSQL_USER_NAME'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_USER_PASSWORD';"
#             exec_command "ALTER USER '$MYSQL_USER_NAME'@'%' IDENTIFIED WITH mysql_native_password BY '$MYSQL_USER_PASSWORD';"
#         fi
        
#         exec_command "echo \"GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER_NAME'@'localhost';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
#         exec_command "echo \"GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER_NAME'@'%';\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""
#         exec_command "echo \"FLUSH PRIVILEGES;\" | mysql -u $MYSQL_ROOT_USER --password=\"$MYSQL_ROOT_PASSWORD\""

#         # Enable remote connections
#         highlight_text "Enable remote connections to MySQL..."

#         if [ "$MYSQL_VERSION" == "8" ]; then
#             exec_command "echo -e \"[mysqld]\ndefault_authentication_plugin = mysql_native_password\" | tee -a /etc/mysql/conf.d/mysql.cnf"
#         else
#             exec_command sed -i \'s/^bind-address/#bind-address/\' $MYSQL_CONFIG_PATH
#         fi

#         exec_command sed -i \'s/^skip-external-locking/#skip-external-locking/\' $MYSQL_CONFIG_PATH
        

#         # Restart MySQL
#         highlight_text "Restart MySQL..."

#         exec_command "service mysql restart"
#     fi
# else
#     warning_text "Already installed."
# fi

# # Install PHP module
# if [ -x "$(command -v mysql)" ]; then
#     PHP_VERSIONS=($PHP_VERSIONS)

#     line_break
#     highlight_text "Install PHP MySQL module..."

#     for PHP_VERSION in "${PHP_VERSIONS[@]}"; do
#         exec_command "apt-get install -y php$PHP_VERSION-mysql"
#     done
# fi

# phpMyAdmin
if [ ! -z "$PHPMYADMIN" ]; then
    /vagrant/provision/databases/mysql/phpmyadmin.sh
fi
