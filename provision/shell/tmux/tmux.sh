#!/bin/bash

TMUX_CONF_FILE=/home/vagrant/.tmux.conf.local

# Remove existing tmux
sudo apt-get -y remove tmux

# Download tmux
mkdir /home/vagrant/tmux-src && wget -qO- https://github.com/tmux/tmux/releases/download/${VERSION}/tmux-${VERSION}.tar.gz | tar xvz -C /home/vagrant/tmux-src && cd /home/vagrant/tmux-src/tmux*

# Install tmux
./configure && make -j"$(nproc)" && sudo make install

# Cleanup
cd && rm -rf /home/vagrant/tmux-src

if [ $GPAKOSZ = "true" ]
then
    cd /home/vagrant
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
