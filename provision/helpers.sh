#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

    echo $BAR
    echo -e "${BAR_CHARACTER} ${BLUE}$TITLE${NC} ${BAR_CHARACTER}"
    echo $BAR
}

green_text() {
    echo -e "${GREEN}$1${NC}"
}

red_text() {
    echo -e "${RED}$1${NC}"
}

command_exec_response() {
    COMMAND=$1
    EXIT_CODE=$2

    if [ $EXIT_CODE -eq 0 ];
    then
        green_text "$COMMAND ran successfully."
    else
        red_text "$COMMAND failed ($EXIT_CODE)."
    fi
}

command_exec_response_2() {
    EXIT_CODE=$1
    SUCCESS_TEXT=$2
    ERROR_TEXT=$3

    if [ $EXIT_CODE -eq 0 ];
    then
        green_text "$SUCCESS_TEXT"
    else
        red_text "$ERROR_TEXT"
    fi
}

# DEBUG=1

# run_command() {
#     COMMAND=$1
#
#     echo "~ Run command \"$COMMAND\"..."
#
#     if [ $DEBUG ];
#     then
#         $COMMAND
#     else
#         $COMMAND &>/dev/null
#     fi
#
#     EXIT_CODE=$?
#
#     echo "~ Exit code: $EXIT_CODE"
#
#     if [ $DEBUG ];
#     then
#         if [ $EXIT_CODE -eq 0 ];
#         then
#             echo "~ Command \"$COMMAND\" executed successfully!"
#         else
#             echo "~ Command \"$COMMAND\" failed (Exit code: $EXIT_CODE)"
#         fi
#     fi
# }
