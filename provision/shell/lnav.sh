#!/bin/bash

export LOG_FILE_PATH=shell/lnav.log

. /vagrant/provision/helpers/include.sh

title "LNAV"

highlight_text "Install LNAV..."
exec_command "sudo apt-get install lnav -y"
