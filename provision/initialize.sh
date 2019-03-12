#!/bin/bash

# export DEBIAN_FRONTEND=noninteractive

export NUM_SUCCESSFUL=0
export NUM_ERRORS=0

export LOG_FILE_PATH=initialize.log

. /vagrant/provision/helpers/include.sh

# Install figlet
apt-get -y install figlet &>/dev/null

# Show welcome title
title "PXL Web Vagrant"

echo -e "${BLUE}v${VERSION} (Built on $BUILD_DATE)${NC}"
echo -e "${BLUE}GitHub: https://github.com/PXLbros/pxl-web-vagrant${NC}"
echo -e "${BLUE}Documentation: https://pxlbros.github.io/pxl-web-vagrant${NC}"

line_break

# Initialize empty log directory
rm -rf /vagrant/logs
mkdir -p /vagrant/logs/provision

# Initialize provisioning stats file
init_provisioning_stats

# Configure date/time
highlight_text "Configure date/time..."

exec_command "locale-gen $LC_ALL"
exec_command "dpkg-reconfigure locales"
exec_command "rm /etc/localtime && ln -s /usr/share/zoneinfo/$TIMEZONE /etc/localtime"

# Update APT
highlight_text "Update APT..."
exec_command "apt-get update"

# Upgrade APT
highlight_text "Upgrade APT..."
exec_command "apt-get -y upgrade -o Dpkg::Options::=\"--force-confdef\" -o Dpkg::Options::=\"--force-confold\""

# Install required APT packages
highlight_text "Install required APT packages..."
exec_command "apt-get -y install build-essential libevent-dev libncurses-dev zip unzip"

# Add Vagrant info to .bashrc
BASHRC_PATH=/home/vagrant/.bashrc

if ! grep -qF "PROJECTS_DIR" $BASHRCPATH; then
    exec_command "echo \"
export PROJECTS_DIR=${PROJECTS_DIR}\" >> $BASHRC_PATH"
fi

if ! grep -qF "VAGRANT_NAME" $BASHRCPATH; then
    exec_command "echo \"
export VAGRANT_NAME=${VAGRANT_NAME}\" >> $BASHRC_PATH"
fi

if ! grep -qF "VAGRANT_VERSION" $BASHRCPATH; then
    exec_command "echo \"export VAGRANT_VERSION=${VERSION}\" >> /home/vagrant/.bashrc"
fi

if ! grep -qF "VAGRANT_BUILD_DATE" $BASHRCPATH; then
    exec_command "echo -e \"export VAGRANT_BUILD_DATE=TODO_FIX_QUOTES_IN_INITIALIZE_SH\" >> /home/vagrant/.bashrc"
fi

if ! grep -qF "VAGRANT_IP_ADDRESS" $BASHRCPATH; then
    exec_command "echo \"export VAGRANT_IP_ADDRESS=${IP_ADDRESS}\" >> /home/vagrant/.bashrc"
fi

if ! grep -qF "VAGRANT_TIMEZONE" $BASHRCPATH; then
    exec_command "echo \"export VAGRANT_TIMEZONE=${TIMEZONE}\" >> /home/vagrant/.bashrc"
fi
