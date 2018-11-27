#!/bin/bash

# ...
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo 'deb https://dl.yarnpkg.com/debian/ stable main' | sudo tee /etc/apt/sources.list.d/yarn.list

# Update apt
sudo apt-get update -y

# Install yarn
sudo apt-get install yarn -y

# Global packages
GLOBAL_PACKAGES=(
    'hostile'
)

for GLOBAL_PACKAGE in "${GLOBAL_PACKAGES[@]}"
do
    sudo yarn global add $GLOBAL_PACKAGE
done

# Install provision shell script dependencies
# cd /vagrant/provision/shell/scripts/ \
#     && yarn install
