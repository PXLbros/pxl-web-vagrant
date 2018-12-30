#!/bin/bash

export LOG_FILE_PATH=shell/tmux/tmux.log

. /vagrant/provision/helpers/include.sh

title 'tmux'

TMUX_CONF_FILE=$HOME/.tmux.conf.local

# Check if tmux exists
if [ -x "$(command -v tmux)" ]; then
    # Get current tmux version
    CURRENT_TMUX_VERSION_RAW=$(tmux -V)
    CURRENT_TMUX_VERSION_SPLITTED=(${CURRENT_TMUX_VERSION_RAW//\ / })
    CURRENT_TMUX_VERSION=${CURRENT_TMUX_VERSION_SPLITTED[1]}

    if [ "$CURRENT_TMUX_VERSION" == "$TMUX_VERSION" ];
    then
        warning_text "tmux version $TMUX_VERSION already installed."

        exit
    fi

    highlight_text "Remove existing tmux ($CURRENT_TMUX_VERSION)..."

    exec_command "sudo apt-get -y remove tmux"
fi

# Download/install tmux
highlight_text "Download and install tmux (v$TMUX_VERSION)..."

exec_command "mkdir $HOME/tmux-src"
exec_command "wget -qO- https://github.com/tmux/tmux/releases/download/${TMUX_VERSION}/tmux-${TMUX_VERSION}.tar.gz | tar xvz -C $HOME/tmux-src && cd $HOME/tmux-src/tmux*"
exec_command "./configure"
exec_command "make -j\"\$(nproc)\""
exec_command "sudo make install"

# Cleanup
exec_command "cd && rm -rf $HOME/tmux-src"

if [ "$GPAKOSZ" = "true" ]
then
    # Install gpakosz
    if [ ! -d "$HOME/.tmux" ] # If gpakosz isn't installed
    then
        highlight_text 'Install gpakosz...'

        cd $HOME

        exec_command 'git clone https://github.com/gpakosz/.tmux.git'
        exec_command 'ln -s -f .tmux/.tmux.conf'
        exec_command 'cp .tmux/.tmux.conf.local .'

        # Enable mouse by default
        exec_command "sed -i '/set -g mouse on/s/^#//' $TMUX_CONF_FILE"

        # Increase history size
        exec_command "sed -i '/set -g history-limit/s/^#//' $TMUX_CONF_FILE"

        # Remove uptime from bottom left status bar
        exec_command "sed -i \"s/tmux_conf_theme_status_left=.*/tmux_conf_theme_status_left=' ❐ #S'/g\" $TMUX_CONF_FILE"
    fi
fi
