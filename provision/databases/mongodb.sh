#!/bin/bash

export LOG_FILE_PATH=/vagrant/logs/databases/mongodb.sh

. /vagrant/provision/helpers.sh

title 'MongoDB'

# Install MongoDB
debug_command apt-get install -y mongodb
