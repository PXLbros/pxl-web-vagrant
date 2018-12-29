#!/bin/bash

export LOG_FILE_PATH=cache/redis.log

. /vagrant/provision/helpers/include.sh

title "Redis"

highlight_text "Install Redis..."

debug_command ""
