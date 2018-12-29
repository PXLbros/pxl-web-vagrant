#!/bin/bash

export PROVISION_SHOW_COMMAND=$PROVISION_SHOW_COMMAND
export PROVISION_SHOW_COMMAND_EXECUTION_TIME=$PROVISION_SHOW_COMMAND_EXECUTION_TIME
export PROVISION_SHOW_COMMAND_EXIT_CODE=$PROVISION_SHOW_COMMAND_EXIT_CODE

export NUM_SUCCESSFUL=0
export NUM_ERRORS=0

export DEBIAN_FRONTEND=noninteractive

export LOG_FILE_PATH=init.log

. /vagrant/provision/helpers/include.sh

# Reset provision stats
reset_provisioning_stats

# Install figlet
apt-get -y install figlet &>/dev/null

# Show welcome title
# echo 'Installing FIGlet...'
title 'PXL Web Vagrant'

echo -e "${BLUE}v${VERSION} (Built on $BUILD_DATE)${NC}"

line_break

echo -e "🇺🇸  ${BLUE}Made by${NC} ${YELLOW}PXL Agency (Los Angeles, USA)${NC}"
echo -e "🌎 ${BLUE}See documentation at ${UNDERLINE}pxl-web-vagrant.com${NC}${NC}"
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
highlight_text 'Configure date/time...'

export LANGUAGE="$LANGUAGE_ISO.UTF-8"
export LANG="$LANGUAGE_ISO.UTF-8"

debug_command 'rm /etc/localtime'
debug_command "ln -s /usr/share/zoneinfo/$TIMEZONE /etc/localtime"
debug_command 'dpkg-reconfigure locales'

# Update APT
highlight_text 'Update APT...'

debug_command 'apt-get update'

# Upgrade APT
highlight_text 'Upgrade APT...'

DEBIAN_FRONTEND=noninteractive debug_command 'apt-get -y upgrade'
# -o Dpkg::Options::="--force-confdef" \
# -o Dpkg::Options::="--force-confold" \

# Install required APT packages
highlight_text 'Install required APT packages...'

debug_command 'apt-get -y install build-essential libevent-dev libncurses-dev zip unzip'

# Clean up APT
highlight_text 'Clean up APT...'

debug_command "apt-get autoremove -yf"

# Set home directory
# highlight_text 'Set home directory...'
#
# debug_command 'usermod -d /vagrant/projects/ vagrant'
