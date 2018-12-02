#!/bin/bash

. /vagrant/provision/helpers.sh

title 'Node'

debug_command curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

debug_command source $HOME/.bashrc

export NVM_DIR="$HOME/.nvm"

# Copy NVM_DIR to .bashrc
if ! grep -qF "export NVM_DIR" $HOME/.bashrc
then
    debug_command "echo -e \"\nexport NVM_DIR=$NVM_DIR\" >> $HOME/.bashrc"
fi

# Enable NVM
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install Node
debug_command nvm install --lts

# Set Node version
debug_command nvm use --lts

# Set default Node version
debug_command nvm alias default lts/*

# Change NVM home directory ownership
debug_command sudo chown -R vagrant:vagrant $HOME/.nvm
