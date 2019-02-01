#!/bin/bash

export LOG_FILE_PATH=tmux/tmux-resurrect.log

. /vagrant/provision/helpers/include.sh

title "tmux-resurrect"

TMUX_RESURRECT_DIR=/home/vagrant/tmux-resurrect
TMUX_CONF=$HOME/.tmux.conf.local

# Clone tmux-resurrect GitHub repository
if [[ ! -d $TMUX_RESURRECT_DIR ]]; then
    highlight_text "Clone tmux-resurrect GitHub repository..."
    exec_command "git clone https://github.com/tmux-plugins/tmux-resurrect $TMUX_RESURRECT_DIR"
fi

# Append to .tmux.conf
if [ -f $TMUX_CONF ]; then
    if ! grep -qF "export NVM_DIR" $TMUX_CONF; then
        highlight_text "Append run-shell to .tmux.conf file..."
        exec_command "echo \"run-shell $TMUX_RESURRECT_DIR/resurrect.tmux\" >> $TMUX_CONF"
    fi
else
    error_text "Append run-shell to .tmux.conf file because can't find file $TMUX_CONF."
fi
