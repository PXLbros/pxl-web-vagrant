#!/bin/bash

. /vagrant/provision/helpers/include.sh

# Set home directory
if [ ! -z "$HOME_DIR" ]; then
    highlight_text "Set home directory..."

    # Create directory if not already exists
    if [ ! -d "$HOME_DIR" ]; then
        exec_command "mkdir -p $HOME_DIR"
    fi

    SET_HOME_DIR_COMMAND="cd $HOME_DIR"

    # Add change directory directive to .bashrc
    if ! grep -qF "$SET_HOME_DIR_COMMAND" $HOME/.bashrc
    then        
        exec_command "echo -e \"\n$SET_HOME_DIR_COMMAND\" >> $HOME/.bashrc"
    fi
fi

# Clean up APT
highlight_text "Clean up APT..."
exec_command "sudo apt-get clean"

# Clean up OS
highlight_text "Clean up OS..."
exec_command "sudo rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*"

# Print provisioning stats
print_provisioning_stats

# Clear provisioning stats file
clear_provisioning_stats

# Remove current command temporary file
rm $PROVISIONING_COMMAND_FILE_PATH

line_break
line_break
