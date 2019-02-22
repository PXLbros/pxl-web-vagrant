#!/bin/bash

export LOG_FILE_PATH=databases/postgresql.log

. /vagrant/provision/helpers/include.sh

title "PostgreqSQL"

# Update APT
exec_command "sudo apt update -y"

# Install PostgreSQL
exec_command "sudo apt -y install postgresql postgresql-contrib"

# Allow remote connections
# TODO:
# Change listen_addresses to * in /etc/postgresql/10/main/postgresql.conf
