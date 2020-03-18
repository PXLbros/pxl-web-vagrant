#!/bin/bash

export LOG_FILE_PATH=code/yarn.log

. /vagrant/provision/helpers/include.sh

title "Yarn"

# Update APT
highlight_text "Update APT..."

exec_command "curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -"
exec_command "echo \"deb https://dl.yarnpkg.com/debian/ stable main\" | sudo tee /etc/apt/sources.list.d/yarn.list"
exec_command "sudo apt-get update -y"

# Install yarn
highlight_text "Install Yarn..."
exec_command "sudo apt-get install yarn -y"
