#!/bin/bash

DISABLE_WELCOME_MESSAGE=false
export DEBUG=$DEBUG

# Clear debug.log
rm /vagrant/debug.log

. /vagrant/provision/helpers.sh

apt-get -y install figlet

figlet 'PXL Web Vagrant'

echo ""

export DEBIAN_FRONTEND=noninteractive

# Set language
info_text 'Configure date & time...'

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

# Install necessary APT packages
info_text "Install necessary APT packages..."

debug_command apt-get -y install \
    build-essential \
    libevent-dev \
    libncurses-dev \
    zip unzip

# Clean up APT
info_text "Clean up APT..."

debug_command apt-get autoremove -yf

# Disable default welcome message
debug_command 'chmod -x /etc/update-motd.d/*'

if [ "$DISABLE_WELCOME_MESSAGE" == "true" ];
then
    debug_command sed -i \'/pam_motd.so/s/^/#/\' /etc/pam.d/sshd
else
    debug_command "sudo echo \"figlet PXL Web Vagrant\" > /etc/update-motd.d/01-custom"
    debug_command "sudo chmod +x /etc/update-motd.d/01-custom"
fi

# Disable "Last login" message
debug_command sed -i \'s/PrintLastLog yes/PrintLastLog no/\' /etc/ssh/sshd_config
