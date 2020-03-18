#!/bin/bash

export LOG_FILE_PATH=code/git.log

. /vagrant/provision/helpers/include.sh

title "Git"

SSH_KNOWN_HOSTS_FILE_PATH=~/.ssh/known_hosts

# Add github.com to ~/.ssh/known_hosts file
{ GITHUB_COM_SSH_KEYSCAN_OUTPUT="$(ssh-keyscan github.com)"; } 2>/dev/null

if [ -f "$SSH_KNOWN_HOSTS_FILE_PATH" ]; then
    if ! grep -q "$GITHUB_COM_SSH_KEYSCAN_OUTPUT" "$SSH_KNOWN_HOSTS_FILE_PATH"; then
        highlight_text "Add github.com to ~/.ssh/known_hosts file..."
        exec_command "echo \"$GITHUB_COM_SSH_KEYSCAN_OUTPUT\" >> ~/.ssh/known_hosts"
    fi
fi
