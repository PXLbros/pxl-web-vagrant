#!/bin/bash

. /vagrant/provision/helpers.sh

title 'MongoDB'

# Install MongoDB
debug_command apt-get install -y mongodb
