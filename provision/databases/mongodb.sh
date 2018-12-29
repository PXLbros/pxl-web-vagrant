#!/bin/bash

export LOG_FILE_PATH=databases/mongodb.log

. /vagrant/provision/helpers/include.sh

title 'MongoDB'

# Install MongoDB
debug_command apt-get install -y mongodb
