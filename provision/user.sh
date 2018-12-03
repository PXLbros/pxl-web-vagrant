#!/bin/bash

export LOG_FILE_PATH=/vagrant/logs/user.log

. /vagrant/provision/helpers.sh

title 'User Provision'

USER_BASH_PROFILE_PATH=/vagrant/provision/user/.bash_profile

if [ -e $USER_BASH_PROFILE_PATH ]
then
    USER_BASH_PROFILE_CONTENTS=$(cat $USER_BASH_PROFILE_PATH)

    info_text 'Copy user bash profile...'

    debug_command "echo -e \"\n# User\n$USER_BASH_PROFILE_CONTENTS\" >> $HOME/.bash_profile"

    debug_command source $HOME/.bash_profile
fi
