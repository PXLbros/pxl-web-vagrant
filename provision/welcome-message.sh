#!/bin/bash

. /vagrant/provision/helpers.sh

WELCOME_MESSAGE_PATH=/etc/update-motd.d/01-custom

WELCOME_MESSAGE="#!/bin/bash

. /vagrant/provision/helpers.sh

figlet PXL Web Vagrant

echo ' '

blue_text 'Version 1.0.0 (Built on Dec 1st, 2018)'"

# Disable default welcome message
debug_command 'sudo chmod -x /etc/update-motd.d/*'

if [ "$DISABLE_WELCOME_MESSAGE" == "true" ];
then
    debug_command "sed -i \'/pam_motd.so/s/^/#/\' /etc/pam.d/sshd"
else
    debug_command "echo \"$WELCOME_MESSAGE\" | sudo tee $WELCOME_MESSAGE_PATH"

    if [ -e $WELCOME_MESSAGE_PATH ];
    then
        debug_command "sudo chmod +x $WELCOME_MESSAGE_PATH"
    fi
fi

# Disable "Last login" message
debug_command "sudo sed -i 's/PrintLastLog yes/PrintLastLog no/' /etc/ssh/sshd_config"
debug_command "sudo sed -i 's/#PrintLastLog/PrintLastLog/' /etc/ssh/sshd_config"
debug_command "sudo /etc/init.d/ssh restart"
