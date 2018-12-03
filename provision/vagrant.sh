#!/bin/bash

export DEBUG=$DEBUG
export DEBIAN_FRONTEND=noninteractive

DISABLE_WELCOME_MESSAGE=false

export LOG_FILE_PATH=/vagrant/logs/vagrant.log

. /vagrant/provision/helpers.sh

# Install figlet
apt-get -y install figlet &>/dev/null

# Show welcome title
# echo 'Installing FIGlet...'
title 'PXL Web Vagrant'

echo '💯 Open Source (github.com/PXLbros/pxl-web-vagrant)'
echo '🌎 Los Angeles'
echo '📧 contact@pxl-web-vagrant.com'

echo " "

# Clear logs
if [ -d /vagrant/logs ];
then
    rm -rf /vagrant/logs/*
else
    mkdir /vagrant/logs
fi

# Configure date/time
info_text 'Configure date/time...'

export LANGUAGE="$LANGUAGE_ISO.UTF-8"
export LANG="$LANGUAGE_ISO.UTF-8"

debug_command "rm /etc/localtime"
debug_command "ln -s /usr/share/zoneinfo/$TIMEZONE /etc/localtime"
debug_command "dpkg-reconfigure locales"

# Update APT
info_text 'Update APT...'

debug_command apt-get update

# Upgrade APT
info_text 'Upgrade APT...'

DEBIAN_FRONTEND=noninteractive \
    debug_command \
    apt-get -y \
    upgrade
    # -o Dpkg::Options::="--force-confdef" \
    # -o Dpkg::Options::="--force-confold" \

# Install required APT packages
info_text "Install required APT packages..."

debug_command apt-get -y install \
    build-essential \
    libevent-dev \
    libncurses-dev \
    zip unzip

# Clean up APT
info_text "Clean up APT..."

debug_command "apt-get autoremove -yf"

# Disable default welcome message
debug_command 'sudo chmod -x /etc/update-motd.d/*'

if [ "$DISABLE_WELCOME_MESSAGE" == "true" ];
then
    debug_command "sed -i \'/pam_motd.so/s/^/#/\' /etc/pam.d/sshd"
else
    WELCOME_MESSAGE="$(cat /vagrant/provision/welcome-message.sh)"
    WELCOME_MESSAGE_PATH=/etc/update-motd.d/01-custom

    debug_command "echo \"$WELCOME_MESSAGE\" | sudo tee $WELCOME_MESSAGE_PATH"

    if [ -e $WELCOME_MESSAGE_PATH ];
    then
        debug_command "sudo chmod +x $WELCOME_MESSAGE_PATH"
    fi
fi

# Disable "Last login" message
debug_command "sudo sed -i 's/PrintLastLog yes/PrintLastLog no/' /etc/ssh/sshd_config"
debug_command "sudo sed -i 's/#PrintLastLog/PrintLastLog/' /etc/ssh/sshd_config"
