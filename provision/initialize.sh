#!/bin/bash

# export DEBIAN_FRONTEND=noninteractive

export NUM_SUCCESSFUL=0
export NUM_ERRORS=0

export LOG_FILE_PATH=initialize.log

. /vagrant/provision/helpers/include.sh

# Initialize provisioning stats file
init_provisioning_stats

# Install figlet
apt-get -y install figlet &>/dev/null

# Show welcome title
title "PXL Web Vagrant"

echo -e "${BLUE}v${VERSION} (Built on $BUILD_DATE)${NC}"
echo -e "${BLUE}https://github.com/PXLbros/pxl-web-vagrant${NC}"

line_break

# echo -e "🇺🇸  ${BLUE}Made by${NC} ${YELLOW}PXL Agency (Los Angeles, USA)${NC}"
echo -e "🌎 ${BLUE}See documentation at${NC} ${YELLOW}${UNDERLINE}pxl-web-vagrant.com${NC}${NC}"
echo -e "✉️  ${BLUE}hello@pxl-web-vagrant.com${NC}"

line_break

# Initialize logs
if [ -d /vagrant/logs ]; then
    # Delete log files in log folder
    rm -rf /vagrant/logs/*
else
    # Logs directory doesn't exist, create
    mkdir /vagrant/logs
fi

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

# Set home directory
# highlight_text "Set home directory..."
# exec_command "usermod -d /vagrant/projects/ vagrant"
