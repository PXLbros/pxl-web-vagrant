#!/bin/bash

. /vagrant/provision/helpers.sh

title "node.sh"

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

source $HOME/.bashrc

export NVM_DIR="$HOME/.nvm"

# Copy NVM_DIR to .bashrc
if ! grep -qF "export NVM_DIR" $HOME/.bashrc
then
    echo -e "\nexport NVM_DIR=$NVM_DIR" >> $HOME/.bashrc
fi

# Enable NVM
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install Node
nvm install --lts

# Set Node version
nvm use --lts

# Set default Node version
nvm alias default stable

# Change NVM home directory ownership
sudo chown -R vagrant:vagrant $HOME/.nvm
