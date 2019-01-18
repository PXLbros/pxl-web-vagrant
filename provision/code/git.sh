#!/bin/bash

export LOG_FILE_PATH=code/git.log

. /vagrant/provision/helpers/include.sh

title "Git"

highlight_text "Add github.com to ~/.ssh/known_hosts file..."
ssh-keyscan github.com >> ~/.ssh/known_hosts
