#!/bin/bash

export LOG_FILE_PATH=tmux/tmuxinator.log

. /vagrant/provision/helpers/include.sh

title 'tmuxinator'

# Update Ruby
highlight_text 'Update Ruby...'

exec_command 'sudo apt-add-repository -y ppa:brightbox/ruby-ng'
exec_command 'sudo apt-get -y update'
exec_command 'sudo apt-get install -y rubygems ruby-dev'

# Install tmuxinator
highlight_text 'Install tmuxinator...'

exec_command 'sudo gem install tmuxinator'

# Create tmuxinator directory
exec_command "mkdir -p $HOME/.config/tmuxinator"

# Create "Home" tmuxinator project
HOME_TMUXINATOR_CONTENTS="name: \"$VAGRANT_NAME\"
root: ~/

windows:"

if [ "$APACHE_ENABLED" = "true" ];
then
    HOME_TMUXINATOR_CONTENTS="${HOME_TMUXINATOR_CONTENTS}
  - Apache Sites:
      - sudo su -
      - cd /etc/apache2/sites-available
  - Apache Log:
      root: /var/log/apache2
      panes:
        - sudo lnav /var/log/apache2"
fi

if [ "$NGINX_ENABLED" = "true" ];
then
    HOME_TMUXINATOR_CONTENTS="${HOME_TMUXINATOR_CONTENTS}
- nginx Sites:
    - sudo su -
    - cd /etc/nginx/sites-available
- nginx Log:
    root: /var/log/nginx
    panes:
      - - sudo lnav /var/log/nginx"
fi

# Save tmuxinator "Home" project
exec_command "echo -e \"$HOME_TMUXINATOR_CONTENTS\" > $HOME/.config/tmuxinator/home.yml"

# Set to open tmuxinator "Home" project upon login
# if ! grep -qF "tmuxinator start home" $HOME/.bashrc
# then
#     echo -e "\ntmuxinator start home" >> $HOME/.bashrc
# fi
