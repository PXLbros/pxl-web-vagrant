#!/bin/bash

. /vagrant/provision/helpers.sh

title $VAGRANT_NAME

echo ""

export DEBIAN_FRONTEND=noninteractive

# Set language
info_text 'Configure locale...'

export LANGUAGE="$LANGUAGE_ISO.UTF-8"
export LANG="$LANGUAGE_ISO.UTF-8"

debug_command dpkg-reconfigure locales

# Update APT
info_text "Update APT..."

debug_command apt-get update

# Upgrade APT
info_text "Upgrade APT..."

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
debug_command chmod -x /etc/update-motd.d/*
debug_command sed -i \'/pam_motd.so/s/^/#/\' /etc/pam.d/sshd

# Disable "Last login" message
debug_command sed -i \'s/PrintLastLog yes/PrintLastLog no/\' /etc/ssh/sshd_config
