#!/bin/bash

. /vagrant/provision/helpers/include.sh

# Clean up APT
highlight_text "Clean up APT..."
exec_command "sudo apt-get autoremove -yf"

# Print provisioning stats
print_provisioning_stats

# Clear provisioning stats file
clear_provisioning_stats

# Remove current command temporary file
rm $PROVISIONING_COMMAND_FILE_PATH

# # Set home directory
# if [ ! -z "$HOME_DIR" ]; then
#     highlight_text "Set home directory..."
#     exec_command "mkdir -p $HOME_DIR"
#     exec_command "chown vagrant:vagrant $HOME_DIR"
#     exec_command "usermod -d $HOME_DIR vagrant"
# fi
