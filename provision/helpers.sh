#!/bin/bash

SHOW_COMMAND=true
SHOW_COMMAND_EXECUTION_TIME=true

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
CYAN_BACKGROUND='\033[46m'
NC='\033[0m'
ITALIC='\e[3'

red_title() {
    title $1 'RED'
}

green_title() {
    title $1 'GREEN'
}

yellow_title() {
    title $1 'YELLOW'
}

blue_title() {
    title $1 'BLUE'
}

red_text() {
    echo -e "${RED}$1${NC}"
}

green_text() {
    echo -e "${GREEN}$1${NC}"
}

yellow_text() {
    echo -e "${YELLOW}$1${NC}"
}

blue_text() {
    echo -e "${BLUE}$1${NC}"
}

debug_command() {
    COMMAND=$*

    # LOG_PATH="/vagrant/logs/${pwd}"
    # echo $LOG_PATH
    #
    # mkdir -p $LOG_PATH

    echo -e "Command:\n$COMMAND\n" >> /vagrant/logs/provision.log

    if [ "$SHOW_COMMAND" == "true" ]; then blue_text "\$ $COMMAND"; fi

    SUCCESS=false
    START_TIME=$(date +%s.%N)

    # Execute command
    if [ "$DEBUG" == "true" ];
    then
        if eval "$COMMAND" | tee /vagrant/debug.log; then SUCCESS=true; fi
    else
        if eval "$COMMAND" &>> /vagrant/debug.log; then SUCCESS=true; fi
    fi

    COMMAND_EXIT_CODE=$?

    END_TIME=$(date +%s.%N)

    TIME_TOTAL=$(echo "$END_TIME - $START_TIME" | bc)
    dd=$(echo "$TIME_TOTAL / 86400" | bc)
    dt2=$(echo "$TIME_TOTAL - 86400 * $dd" | bc)
    dh=$(echo "$dt2 / 3600" | bc)
    dt3=$(echo "$dt2 - 3600 * $dh" | bc)
    EXECUTION_TIME_MINUTES=$(echo "$dt3 / 60" | bc)
    EXECUTION_TIME_SECONDS=$(echo "$dt3 - 60 * $EXECUTION_TIME_MINUTES" | bc)

    if [ "$SHOW_COMMAND_EXECUTION_TIME" == "true" ];
    then
        printf "${CYAN}Execution Time:${NC} \e[3m%0.2fs\e[0m\n" $EXECUTION_TIME_SECONDS
    fi

    if [ "$SUCCESS" == 'true' ]; then green_text 'Success!'; else red_text "Fail! ($COMMAND_EXIT_CODE)"; fi

    echo -e " "
}

title() {
    echo -e " "
    figlet $1
    echo -e " "
}

info_text() {
    echo -e "${YELLOW}$1${NC}"
}
