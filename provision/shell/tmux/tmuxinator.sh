#!/bin/bash

# Update Ruby
sudo apt-add-repository -y ppa:brightbox/ruby-ng
sudo apt-get -y update
sudo apt-get -y install ruby-dev

# Install tmuxinator
sudo gem install tmuxinator

# Create tmuxinator directory
mkdir -p ~/.config/tmuxinator

# Create "Home" tmuxinator project
echo "# ~/.tmuxinator/home.yml

name: \"$VM_NAME\"
root: ~/

windows:
  - Home:
      layout: tiled
      root: ~/
      panes:
        - top:
          -
  - Apache:
      layout: tiled
      root: ~/
      panes:
        - sites_available:
          - sudo su -
          - cd /etc/apache2/sites-available
        - log:
          - sudo su -
          - cd /var/log/apache2
  - PHP:
      layout: tiled
      root: ~/
      panes:
        - dir:
          - sudo su -
          - cd /etc/php
  - MySQL:
      layout: tiled
      root: ~/
      panes:
        - dir:
          - sudo su -
          - cd /etc/mysql
        - log:
          - sudo su -
          - cd /var/log/mysql
          - tail -f error.log" > /home/vagrant/.config/tmuxinator/home.yml

# Set to open tmuxinator project "Home" upon SSH login
if ! grep -qF "tmuxinator start home" /home/vagrant/.bashrc
then
    echo -e "\ntmuxinator start home" >> /home/vagrant/.bashrc
fi
