#!/bin/bash

. /vagrant/provision/helpers.sh

USER_BASH_PROFILE_PATH=/vagrant/provision/user/.bash_profile

if [ -e $USER_BASH_PROFILE_PATH ]
then
    USER_BASH_PROFILE_CONTENTS=$(cat $USER_BASH_PROFILE_PATH)

    echo -e "\n# User\n$USER_BASH_PROFILE_CONTENTS" >> $HOME/.bash_profile

    source $HOME/.bash_profile
fi
