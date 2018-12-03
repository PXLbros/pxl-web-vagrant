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

    echo -e "Command:\n$COMMAND\n" >> /vagrant/debug.log

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
        printf "Execution Time: \e[3m%0.2fs\e[0m\n" $EXECUTION_TIME_SECONDS
    fi

    if [ "$SUCCESS" == 'true' ]; then green_text 'Success!'; else red_text "Fail! ($COMMAND_EXIT_CODE)"; fi

    echo -e " "
}

title() {
    TITLE=$1
    TITLE_LENGTH=${#TITLE}
    TITLE_LENGTH_EXTRA=$((TITLE_LENGTH+2))

    BAR_CHARACTER='~'

    BAR=''
    SPACE=''
    TITLE_SPACE=''

    for i in $(eval echo {1..$((TITLE_LENGTH+56))})
    do
        BAR="${BAR}${BAR_CHARACTER}"
    done

    for i in $(eval echo {1..$((TITLE_LENGTH+54))})
    do
        SPACE="${SPACE} "
    done

    for i in $(eval echo {1..$((TITLE_LENGTH+15))})
    do
        TITLE_SPACE="${TITLE_SPACE} "
    done

    echo -e " "
    echo -e "${PURPLE}${BAR}${NC}"
    echo -e "${PURPLE}${BAR_CHARACTER}${SPACE}${BAR_CHARACTER}${NC}"
    echo -e "${PURPLE}${BAR_CHARACTER}${SPACE}${BAR_CHARACTER}${NC}"
    echo -e "${PURPLE}${BAR_CHARACTER}${TITLE_SPACE}${TITLE}${TITLE_SPACE}${BAR_CHARACTER}${NC}"
    echo -e "${PURPLE}${BAR_CHARACTER}${SPACE}${BAR_CHARACTER}${NC}"
    echo -e "${PURPLE}${BAR_CHARACTER}${SPACE}${BAR_CHARACTER}${NC}"
    echo -e "${PURPLE}${BAR}${NC}"
    echo -e " "
}

info_text() {
    echo -e "${YELLOW}$1${NC}"
}
