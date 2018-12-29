#!/bin/bash

export LOG_FILE_PATH=node.log

. /vagrant/provision/helpers/include.sh

title 'Node'

highlight_text 'Install NVM...'

debug_command "curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash && source $HOME/.bashrc"

export NVM_DIR="$HOME/.nvm"

# Copy NVM_DIR to .bashrc
if ! grep -qF "export NVM_DIR" $HOME/.bashrc
then
    highlight_text 'Set NVM to automatically run...'

    debug_command "echo -e \"\nexport NVM_DIR=$NVM_DIR\" >> $HOME/.bashrc"
fi

# Enable NVM
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install Node
debug_command nvm install --lts

# Set Node version
highlight_text 'Set Node version...'

debug_command nvm use --lts

# Set default Node version
debug_command nvm alias default lts/*

# Change NVM home directory ownership
highlight_text 'Give Vagrant user NVM home directory permission...'

debug_command sudo chown -R vagrant:vagrant $HOME/.nvm
