#!/bin/bash

export LOG_FILE_PATH=databases/mongodb.log

. /vagrant/provision/helpers/include.sh

MONGODB_CONFIG_FILE_PATH=/etc/mongodb.conf

title 'MongoDB'

# Install MongoDB
highlight_text "Install MongoDB..."
exec_command "apt-get install -y mongodb"
