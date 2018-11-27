#!/bin/bash

# Update Ruby
sudo apt-add-repository -y ppa:brightbox/ruby-ng
sudo apt-get -y update
sudo apt-get install -y \
    rubygems \
    ruby-dev

# Install tmuxinator
sudo gem install tmuxinator

# Create tmuxinator directory
mkdir -p /home/vagrant/.config/tmuxinator

# Create "Home" tmuxinator project
HOME_TMUXINATOR_CONTENTS="name: \"$VM_NAME\"\n
root: ~/\n
\n
windows:\n
    - Home"

if [ $APACHE = "true" ];
then
    HOME_TMUXINATOR_CONTENTS="${HOME_TMUXINATOR_CONTENTS}\n
- Apache Sites:\n
    - sudo su -\n
    - cd /etc/apache2/sites-available\n
- Apache Log:\n
    root: /var/log/apache2\n
    layout: tiled\n
    panes:\n
      - access_log:\n
        - sudo su -\n
        - tail -f access.log\n
      - error_log:\n
        - sudo su -\n
        - tail -f error.log\n"
fi

if [ $NGINX = "true" ];
then
    HOME_TMUXINATOR_CONTENTS="${HOME_TMUXINATOR_CONTENTS}
- nginx Sites:\n
    - sudo su -\n
    - cd /etc/nginx/sites-available\n
- nginx Log:\n
    root: /var/log/nginx\n
    layout: tiled\n
    panes:\n
      - access_log:\n
        - sudo su -\n
        - tail -f access.log\n
      - error_log:\n
        - sudo su -\n
        - tail -f error.log\n"
fi

echo $HOME_TMUXINATOR_CONTENTS

# Save tmuxinator "Home" project
echo -e $HOME_TMUXINATOR_CONTENTS > /home/vagrant/.config/tmuxinator/home.yml

# Set to open tmuxinator "Home" project upon login
if ! grep -qF "tmuxinator start home" /home/vagrant/.bashrc
then
    echo -e "\ntmuxinator start home" >> /home/vagrant/.bashrc
fi
