#!/bin/bash

export LOG_FILE_PATH=yarn.log

. /vagrant/provision/helpers/include.sh

title 'Yarn'

# Update apt
highlight_text 'Update APT...'

debug_command 'curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -'
debug_command "echo \"deb https://dl.yarnpkg.com/debian/ stable main\" | sudo tee /etc/apt/sources.list.d/yarn.list"
debug_command 'sudo apt-get update -y'

# Install yarn
highlight_text 'Install Yarn...'

debug_command 'sudo apt-get install yarn -y'

# Global packages
highlight_text 'Install global packages...'

GLOBAL_PACKAGES=(
    'hostile'
    'ngrok'
)

for GLOBAL_PACKAGE in "${GLOBAL_PACKAGES[@]}"
do
    debug_command "sudo yarn global add $GLOBAL_PACKAGE"
done

# Install provision shell script dependencies
cd /vagrant/provision/shell/scripts/

debug_command 'yarn install'
