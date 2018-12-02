#!/bin/bash

DEBUG=false
SEMI_DEBUG=true

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
CYAN_BACKGROUND='\033[46m'
NC='\033[0m'

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
    # COMMAND=$@
    COMMAND=$*

    if [ "$SEMI_DEBUG" == "true" ]; then blue_text "Command:" && blue_text "$COMMAND" && echo -e ""; fi

    if [ "$DEBUG" == "true" ];
    then
        if eval "$COMMAND" | tee /vagrant/debug.log;
        then
            green_text 'Success!'
        else
            red_text 'Fail!'
        fi
    else
        if eval "$COMMAND" &>> /vagrant/debug.log;
        then
            green_text 'Success!'
        else
            red_text 'Fail!'
        fi
    fi

    echo -e " "
}

title() {
    TITLE=$1
    TITLE_LENGTH=${#TITLE}
    TITLE_LENGTH_EXTRA=$((TITLE_LENGTH+2))

    BAR_CHARACTER="~"

    BAR=""

    for i in $(eval echo {1..$((TITLE_LENGTH+4))})
    do
        BAR="${BAR}${BAR_CHARACTER}"
    done

    echo -e "${PURPLE}${BAR}${NC}"
    echo -e "${PURPLE}${BAR_CHARACTER} $TITLE ${BAR_CHARACTER}${NC}"
    echo -e "${PURPLE}${BAR}${NC}"
}

info_text() {
    echo -e "${YELLOW}$1${NC}"
}
