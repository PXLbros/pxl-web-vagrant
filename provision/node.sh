#!/bin/bash

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

source /home/vagrant/.bashrc

export NVM_DIR="/home/vagrant/.nvm"

# Copy NVM_DIR to .bashrc
if ! grep -qF "export NVM_DIR" /home/vagrant/.bashrc
then
    echo "export NVM_DIR=$NVM_DIR" >> /home/vagrant/.bashrc
fi

# Enable NVM
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install Node
nvm install --lts

# Set Node version
nvm use --lts

# Set default Node version
nvm alias default --lts

# Change NVM home directory ownership
sudo chown -R vagrant:vagrant /home/vagrant/.nvm
