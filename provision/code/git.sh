#!/bin/bash

export LOG_FILE_PATH=code/git.log

. /vagrant/provision/helpers/include.sh

title "Git"

SSH_KNOWN_HOSTS_FILE_PATH=~/.ssh/known_hosts

# Add github.com to ~/.ssh/known_hosts file
GITHUB_COM_SSH_KEYSCAN_OUTPUT=$(ssh-keyscan github.com)

if [ -f "$SSH_KNOWN_HOSTS_FILE_PATH" ]; then
    if ! grep -q "$GITHUB_COM_SSH_KEYSCAN_OUTPUT" "$SSH_KNOWN_HOSTS_FILE_PATH"; then
        highlight_text "Add github.com to ~/.ssh/known_hosts file..."
        exec_command "$GITHUB_COM_SSH_KEYSCAN_OUTPUT >> ~/.ssh/known_hosts"
    else
        echo "GITHUB ALREADY ADDED TO KNOWN HOSTS"
    fi
fi
