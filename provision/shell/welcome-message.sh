#!/bin/bash

export LOG_FILE_PATH=shell/welcome-message.sh

. /vagrant/provision/helpers/include.sh

WELCOME_MESSAGE_PATH=/etc/update-motd.d/01-custom

WELCOME_MESSAGE="#!/bin/bash

. /vagrant/provision/helpers/include.sh

line_break

figlet PXL Web Vagrant

line_break

blue_text 'v$VERSION (Built on $BUILD_DATE)'
blue_text 'https://github.com/PXLbros/pxl-web-vagrant'

line_break

cyan_text 'Name: $VAGRANT_NAME'
cyan_text 'IP: $IP_ADDRESS'

line_break"

# if [ -f "/vagrant/.config/tmuxinator/home.yml" ]; then
#     WELCOME_MESSAGE="${WELCOME_MESSAGE}Run \"tmuxinator start home\" to start.
# line_break"
# fi

# Disable default welcome message
highlight_text "Disable default welcome message..."

# Disable "Last login" message
exec_command "sudo sed -i 's/PrintLastLog yes/PrintLastLog no/' /etc/ssh/sshd_config"
exec_command "sudo sed -i 's/#PrintLastLog/PrintLastLog/' /etc/ssh/sshd_config"
exec_command "sudo /etc/init.d/ssh restart"

exec_command "sudo chmod -x /etc/update-motd.d/*"

highlight_text "Set custom welcome message..."

exec_command "echo \"$WELCOME_MESSAGE\" | sudo tee $WELCOME_MESSAGE_PATH"

# Make custom welcome message file executable
if [ -e $WELCOME_MESSAGE_PATH ]; then
    exec_command "sudo chmod +x $WELCOME_MESSAGE_PATH"
fi
