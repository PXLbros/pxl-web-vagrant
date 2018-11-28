#!/bin/bash

. /vagrant/provision/helpers.sh

title "yarn.sh"

# ...
export APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1
echo "BEFORE APT-key add"
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "AFTER APT-key add"
echo 'deb https://dl.yarnpkg.com/debian/ stable main' | sudo tee /etc/apt/sources.list.d/yarn.list

# Update apt
title "yarn.sh (Update APT)"

sudo apt-get update -y

# Install yarn
title "yarn.sh (Install Yarn)"

sudo apt-get install yarn -y

# Global packages
title "yarn.sh (Install global packages)"

GLOBAL_PACKAGES=(
    'hostile'
)

for GLOBAL_PACKAGE in "${GLOBAL_PACKAGES[@]}"
do
    title "yarn.sh (Install global package \"$GLOBAL_PACKAGE\")"

    sudo yarn global add $GLOBAL_PACKAGE
done

# Install provision shell script dependencies
# cd /vagrant/provision/shell/scripts/ \
#     && yarn install
