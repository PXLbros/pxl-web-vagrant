#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

# Set language and reconfigure dpkg
export LANGUAGE=en_US.UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
locale-gen en_US.UTF-8
dpkg-reconfigure locales

# Update APT
apt-get update

# Upgrade APT
DEBIAN_FRONTEND=noninteractive \
    apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    upgrade

# Install necessary APT packages
apt-get -y install \
    build-essential \
    libevent-dev \
    libncurses-dev

# Clean up APT
apt-get autoremove -yf

# Disable default welcome message
chmod -x /etc/update-motd.d/*
sed -i '/pam_motd.so/s/^/#/' /etc/pam.d/sshd

# Disable "Last login" message
sed -i 's/PrintLastLog yes/PrintLastLog no/' /etc/ssh/sshd_config
