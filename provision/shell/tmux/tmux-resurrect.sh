#!/bin/bash

export LOG_FILE_PATH=tmux/tmux-resurrect.log

. /vagrant/provision/helpers/include.sh

title "tmux-resurrect"

TMUX_RESURRECT_DIR=/home/vagrant/tmux-resurrect

# Clone tmux-resurrect GitHub repository
highlight_text "Clone tmux-resurrect GitHub repository..."
exec_command "git clone https://github.com/tmux-plugins/tmux-resurrect $TMUX_RESURRECT_DIR"

# Append to .tmux.conf
highlight_text "Append run-shell to .tmux.conf file..."
exec_command "echo \"run-shell $TMUX_RESURRECT_DIR/resurrect.tmux\" >> $HOME/.tmux.conf"
