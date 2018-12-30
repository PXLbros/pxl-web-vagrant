#!/bin/bash

. /vagrant/provision/helpers/include.sh

WELCOME_MESSAGE_PATH=/etc/update-motd.d/01-custom

WELCOME_MESSAGE="#!/bin/bash

. /vagrant/provision/helpers/include.sh

echo ' '

figlet PXL Web Vagrant

echo ' '

blue_text 'v$VERSION (Built on $BUILD_DATE)'

echo ' '"

# Disable default welcome message
highlight_text 'Disable default welcome message...'

# Disable "Last login" message
exec_command "sudo sed -i 's/PrintLastLog yes/PrintLastLog no/' /etc/ssh/sshd_config"
exec_command "sudo sed -i 's/#PrintLastLog/PrintLastLog/' /etc/ssh/sshd_config"
exec_command "sudo /etc/init.d/ssh restart"

exec_command "sudo chmod -x /etc/update-motd.d/*"

highlight_text "Set custom welcome message..."

exec_command "echo \"$WELCOME_MESSAGE\" | sudo tee $WELCOME_MESSAGE_PATH"

if [ -e $WELCOME_MESSAGE_PATH ];
then
    exec_command "sudo chmod +x $WELCOME_MESSAGE_PATH"
fi
