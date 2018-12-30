#!/bin/bash

. /vagrant/provision/helpers/include.sh

# Clean up APT
highlight_text "Clean up APT..."
exec_command "sudo apt-get autoremove -yf"

line_break

# Print provisioning stats
print_provisioning_stats

# Clear provisioning stats file
clear_provisioning_stats

# Remove .command_output file
rm /vagrant/.command_output
