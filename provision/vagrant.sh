#!/bin/bash

export DEBUG=$DEBUG
export DEBIAN_FRONTEND=noninteractive

DISABLE_WELCOME_MESSAGE=false

. /vagrant/provision/helpers.sh

# Install figlet
apt-get -y install figlet &>/dev/null

# Show welcome title
title 'PXL Web Vagrant'

# Clear provision.log
if [ -d /vagrant/logs ];
then
    if [ -f /vagrant/logs/provision.log ];
    then
        debug_command "rm /vagrant/logs/provision.log"
    fi
else
    mkdir /vagrant/logs
fi

# Configure date/time
info_text 'Configure date/time...'

export LANGUAGE="$LANGUAGE_ISO.UTF-8"
export LANG="$LANGUAGE_ISO.UTF-8"

debug_command rm /etc/localtime
debug_command ln -s /usr/share/zoneinfo/$TIMEZONE /etc/localtime
debug_command dpkg-reconfigure locales

# Update APT
info_text 'Update APT...'

debug_command apt-get update

# Upgrade APT
info_text 'Upgrade APT...'

DEBIAN_FRONTEND=noninteractive \
    debug_command \
    apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    upgrade

# Install required APT packages
info_text "Install required APT packages..."

debug_command apt-get -y install \
    build-essential \
    libevent-dev \
    libncurses-dev \
    zip unzip

# Clean up APT
info_text "Clean up APT..."

debug_command apt-get autoremove -yf

# Disable default welcome message
debug_command 'sudo chmod -x /etc/update-motd.d/*'

if [ "$DISABLE_WELCOME_MESSAGE" == "true" ];
then
    debug_command "sed -i \'/pam_motd.so/s/^/#/\' /etc/pam.d/sshd"
else
    debug_command "sudo echo -e \"#!/bin/bash\n\nfiglet 'PXL Web Vagrant'\n\necho \"Start by typing \'tmuxinator start home\'.\n\nProjects:\n- load_project\n- create_project\n- delete_project\"\" > /etc/update-motd.d/01-custom"
    debug_command "sudo chmod +x /etc/update-motd.d/01-custom"
fi

# Disable "Last login" message
debug_command "sed -i 's/PrintLastLog yes/PrintLastLog no/' /etc/ssh/sshd_config"
