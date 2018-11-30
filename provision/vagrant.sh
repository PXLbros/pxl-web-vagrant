#!/bin/bash

. /vagrant/provision/helpers.sh

export DEBIAN_FRONTEND=noninteractive

# Set language
title "vagrant.sh (Configure locale)"

export LANGUAGE=en_US.UTF-8
export LANG=en_US.UTF-8

# local-gen
locale-gen en_US.UTF-8

command_exec_response "locale-gen" $?

# dpkg-reconfigure
dpkg-reconfigure locales

command_exec_response "dpkg-reconfigure" $?

# Update APT
title "vagrant.sh (Update APT)"

apt-get update

command_exec_response "apt-update" $?

# Upgrade APT
title "vagrant.sh (Upgrade APT)"

DEBIAN_FRONTEND=noninteractive \
    apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    upgrade

command_exec_response "apt-upgrade" $?

# Install necessary APT packages
title "vagrant.sh (Install necessary APT packages)"

apt-get -y install \
    build-essential \
    libevent-dev \
    libncurses-dev \
    zip unzip

command_exec_response "apt-install" $?

# Clean up APT
title "vagrant.sh (Clean up APT)"

apt-get autoremove -yf

command_exec_response "apt-get autoremove" $?

# Disable default welcome message
chmod -x /etc/update-motd.d/*
sed -i '/pam_motd.so/s/^/#/' /etc/pam.d/sshd

# Disable "Last login" message
sed -i 's/PrintLastLog yes/PrintLastLog no/' /etc/ssh/sshd_config
