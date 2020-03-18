#!/bin/bash

export LOG_FILE_PATH=code/node.log

. /vagrant/provision/helpers/include.sh

title "Node"

highlight_text "Install NVM..."

exec_command "curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash && source $HOME/.bashrc"

export NVM_DIR="$HOME/.nvm"

# Copy NVM_DIR to .bashrc
if ! grep -qF "export NVM_DIR" $HOME/.bashrc
then
    highlight_text 'Set NVM to automatically run...'

    exec_command "echo -e \"\nexport NVM_DIR=$NVM_DIR\" >> $HOME/.bashrc"
fi

# Enable NVM
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install Node
exec_command "nvm install --lts"

# Set Node version
highlight_text "Set Node version..."

exec_command "nvm use --lts"

# Set default Node version
exec_command "nvm alias default lts/*"

# Change NVM home directory ownership
highlight_text "Give Vagrant user NVM home directory permissions..."

exec_command "sudo chown -R vagrant:vagrant $HOME/.nvm"

# Global NPM packages
GLOBAL_NPM_PACKAGES=(
    "hostile"
    "ngrok"
)

for GLOBAL_NPM_PACKAGE in "${GLOBAL_NPM_PACKAGES[@]}"
do
    highlight_text "Install $GLOBAL_NPM_PACKAGE..."
    exec_command "npm install -g $GLOBAL_NPM_PACKAGE"
done

# # Install provision shell script dependencies
# cd /vagrant/scripts/

# exec_command "npm install"
