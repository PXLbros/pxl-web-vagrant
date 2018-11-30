#!/bin/bash

. /vagrant/provision/helpers.sh

title "tmux.sh"

TMUX_CONF_FILE=$HOME/.tmux.conf.local

# Remove existing tmux
title "tmux.sh (Remove existing)"

sudo apt-get -y remove tmux

# Download tmux
title "tmux.sh (Download)"

mkdir $HOME/tmux-src && wget -qO- https://github.com/tmux/tmux/releases/download/${VERSION}/tmux-${VERSION}.tar.gz | tar xvz -C $HOME/tmux-src && cd $HOME/tmux-src/tmux*

# Install tmux
title "tmux.sh (Install)"

./configure && make -j"$(nproc)" && sudo make install

# Cleanup
cd && rm -rf $HOME/tmux-src

if [ "$GPAKOSZ" = "true" ]
then
    echo $HOME/.tmux.git

    if [ ! -d "$HOME/.tmux" ]
    then
        title "tmux.sh (Install gpakosz)"

        cd $HOME
        git clone https://github.com/gpakosz/.tmux.git
        ln -s -f .tmux/.tmux.conf
        cp .tmux/.tmux.conf.local .

        # Enable mouse by default
        sed -i '/set -g mouse on/s/^#//' $TMUX_CONF_FILE

        # Increase history size
        sed -i '/set -g history-limit/s/^#//' $TMUX_CONF_FILE

        # Remove uptime from bottom left status bar
        sed -i "s/tmux_conf_theme_status_left=.*/tmux_conf_theme_status_left=' ❐ #S'/g" $TMUX_CONF_FILE
    fi
fi
