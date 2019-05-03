#!/bin/bash

LOG_LINE_SEPARATOR="----------------------------------------------------------------------------------------------------"

LOGS_DIR=/vagrant/logs
PROVISIONS_LOG_DIR=$LOGS_DIR/provision
ERROR_LOG_PATH=$LOGS_DIR/errors.log

PROVISIONING_STATS_FILE_PATH=$PROVISIONS_LOG_DIR/.stats
PROVISIONING_COMMAND_FILE_PATH=$PROVISIONS_LOG_DIR/.command

if [ -z "$LOG_FILE_PATH" ]; then
    LOG_FILE_PATH=$LOGS_DIR/provision.log
else
    LOG_FILE_PATH="$PROVISIONS_LOG_DIR/$LOG_FILE_PATH"
fi

. /vagrant/provision/helpers/text.sh
. /vagrant/provision/helpers/functions.sh
