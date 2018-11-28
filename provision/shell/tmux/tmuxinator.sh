#!/bin/bash

. /vagrant/provision/helpers.sh

title "tmuxinator.sh"

# Update Ruby
title "tmuxinator.sh (Update Ruby)"

sudo apt-add-repository -y ppa:brightbox/ruby-ng
sudo apt-get -y update
sudo apt-get install -y \
    rubygems \
    ruby-dev

# Install tmuxinator
title "tmuxinator.sh (Install)"

sudo gem install tmuxinator

# Create tmuxinator directory
mkdir -p $HOME/.config/tmuxinator

# Create "Home" tmuxinator project
HOME_TMUXINATOR_CONTENTS="name: \"$VM_NAME\"
root: ~/

windows:
  - Home:"

if [ "$APACHE" = "true" ];
then
    HOME_TMUXINATOR_CONTENTS="${HOME_TMUXINATOR_CONTENTS}
- Apache Sites:
    - sudo su -
    - cd /etc/apache2/sites-available
- Apache Log:
    root: /var/log/apache2
    panes:
      - access_log:
        - sudo su -
        - tail -f access.log
      - error_log:
        - sudo su -
        - tail -f error.log"
fi

if [ "$NGINX" = "true" ];
then
    HOME_TMUXINATOR_CONTENTS="${HOME_TMUXINATOR_CONTENTS}
- nginx Sites:
    - sudo su -
    - cd /etc/nginx/sites-available
- nginx Log:
    root: /var/log/nginx
    panes:
      - access_log:
        - sudo su -
        - tail -f access.log
      - error_log:
        - sudo su -
        - tail -f error.log"
fi

# Save tmuxinator "Home" project
echo -e "$HOME_TMUXINATOR_CONTENTS" > $HOME/.config/tmuxinator/home.yml

# Set to open tmuxinator "Home" project upon login
if ! grep -qF "tmuxinator start home" $HOME/.bashrc
then
    echo -e "\ntmuxinator start home" >> $HOME/.bashrc
fi
