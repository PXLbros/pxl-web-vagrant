#!/bin/bash

export LOG_FILE_PATH=/vagrant/logs/tmux.sh

. /vagrant/provision/helpers.sh

title 'tmux'

TMUX_CONF_FILE=$HOME/.tmux.conf.local

# Remove existing tmux
info_text 'Remove existing tmux...'

debug_command "sudo apt-get -y remove tmux"

# Download tmux
info_text 'Download tmux...'

debug_command "mkdir $HOME/tmux-src"
debug_command "wget -qO- https://github.com/tmux/tmux/releases/download/${VERSION}/tmux-${VERSION}.tar.gz | tar xvz -C $HOME/tmux-src && cd $HOME/tmux-src/tmux*"

# Install tmux
info_text 'Install tmux...'

debug_command "./configure"
debug_command "make -j\"\$(nproc)\""
debug_command "sudo make install"

# Cleanup
debug_command "cd && rm -rf $HOME/tmux-src"

if [ "$GPAKOSZ" = "true" ]
then
    debug_command "echo $HOME/.tmux.git"

    if [ ! -d "$HOME/.tmux" ]
    then
        info_text 'Install gpakosz...'

        cd $HOME

        debug_command 'git clone https://github.com/gpakosz/.tmux.git'
        debug_command 'ln -s -f .tmux/.tmux.conf'
        debug_command 'cp .tmux/.tmux.conf.local .'

        # Enable mouse by default
        debug_command "sed -i '/set -g mouse on/s/^#//' $TMUX_CONF_FILE"

        # Increase history size
        debug_command "sed -i '/set -g history-limit/s/^#//' $TMUX_CONF_FILE"

        # Remove uptime from bottom left status bar
        debug_command "sed -i \"s/tmux_conf_theme_status_left=.*/tmux_conf_theme_status_left=' ❐ #S'/g\" $TMUX_CONF_FILE"
    fi
fi
