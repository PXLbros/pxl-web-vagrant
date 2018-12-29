#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

export NUM_TOTAL=0
export NUM_SUCCESSFUL=0
export NUM_ERRORS=0

export LOG_FILE_PATH=/vagrant/logs/init.log

. /vagrant/provision/helpers/include.sh

# Reset provision stats
reset_provisioning_stats

# Install figlet
apt-get -y install figlet &>/dev/null

# Show welcome title
# echo 'Installing FIGlet...'
title 'PXL Web Vagrant'

echo -e "${YELLOW}v${VERSION}${NC} ${BLUE}(Built on $BUILD_DATE)${NC}"

echo " "

echo -e "🇺🇸  ${BLUE}Made by${NC} ${YELLOW}PXL Agency${NC} \(${YELLOW}Los Angeles, USA\)${NC}"
echo -e "🌎 ${BLUE}${UNDERLINE}pxl-web-vagrant.com${NC}${NC}"

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

debug_command 'rm /etc/localtime'
debug_command "ln -s /usr/share/zoneinfo/$TIMEZONE /etc/localtime"
debug_command 'dpkg-reconfigure locales'

# Update APT
info_text 'Update APT...'

debug_command 'apt-get update'

# Upgrade APT
info_text 'Upgrade APT...'

DEBIAN_FRONTEND=noninteractive debug_command 'apt-get -y upgrade'
# -o Dpkg::Options::="--force-confdef" \
# -o Dpkg::Options::="--force-confold" \

# Install required APT packages
info_text 'Install required APT packages...'

debug_command 'apt-get -y install build-essential libevent-dev libncurses-dev zip unzip'

# Clean up APT
info_text 'Clean up APT...'

debug_command "apt-get autoremove -yf"

# Set home directory
# info_text 'Set home directory...'
#
# debug_command 'usermod -d /vagrant/projects/ vagrant'
