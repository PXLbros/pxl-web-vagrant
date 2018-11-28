#!/bin/bash

. /vagrant/provision/helpers.sh

title "mongodb.sh"

# Install MongoDB
apt-get install -y mongodb
