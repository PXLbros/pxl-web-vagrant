#!/bin/bash

PROVISION_LOG_DIR=/vagrant/logs/provisions
ERROR_LOG_PATH=/vagrant/logs/errors.log

update_provisioning_stats() {
    local result=$1

    if [ -f $TMP_PROVISIONING_FILE_PATH ]; then
        local file_contents=`cat $TMP_PROVISIONING_FILE_PATH`
    else
        local file_contents="0;0"
    fi

    local results=(${file_contents//;/ })

    local num_successful=${results[0]}
    local num_errors=${results[1]}

    if [ "$result" == "success" ]; then
        num_successful=$((num_successful + 1))
    elif [ "$result" == "error" ]; then
        num_errors=$((num_errors + 1))
    fi

    echo "$num_successful;$num_errors" > $TMP_PROVISIONING_FILE_PATH
}

reset_provisioning_stats() {
    echo '0;0' > $TMP_PROVISIONING_FILE_PATH
}

print_provisioning_stats() {
    if [ ! -f $TMP_PROVISIONING_FILE_PATH ]; then
        exit 0
    fi

    local file_contents=`cat $TMP_PROVISIONING_FILE_PATH`
    local results=(${FILE_CONTENTS//;/ })

    local num_successful=${results[0]}
    local num_errors=${results[1]}
    local num_total=$((num_successful + num_errors))

    if (( num_total > 0 )); then
        error_text "There were $num_errors errors of $num_total total commands."
        error_text "See logs/ folder for more details."
    else
        highlight_text "\nPXL Web Vagrant has been provisioned!"
        highlight_text "Start by running command \"vagrant ssh\"."
    fi
}

debug_command() {
    local command=$*

    # If no LOG_FILE_PATH specified
    if [ -z "$LOG_FILE_PATH" ]; then
        LOG_PATH=/vagrant/logs/provision.log
    else
        LOG_PATH="$PROVISION_LOG_DIR/$LOG_FILE_PATH"
    fi

    LOG_PATH_DIR=$(dirname "${LOG_PATH}")

    sudo mkdir -p $LOG_PATH_DIR

    echo -e "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n$command\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n" >> $LOG_PATH

    if [ "$SHOW_COMMAND" == "true" ]; then blue_text "\$ $command"; fi

    SUCCESS=false
    START_TIME=$(date +%s.%N)

    # Execute command
    if [ "$SHOW_COMMAND_OUTPUT" == "true" ]; then
        # Show command output
        if eval "$command" | tee $LOG_PATH; then SUCCESS=true; fi
    else
        # Hide command output
        if eval "$command" &>> $LOG_PATH; then SUCCESS=true; fi
    fi

    COMMAND_EXIT_CODE=$?

    if [ "$SUCCESS" == "true" ]; then
        update_provisioning_stats success

        NUM_SUCCESSFUL=$((NUM_SUCCESSFUL+1))
    else
        update_provisioning_stats error

        NUM_ERRORS=$((NUM_ERRORS+1))
    fi

    END_TIME=$(date +%s.%N)
    TIME_TOTAL=$(echo "$END_TIME - $START_TIME" | bc)
    local dd=$(echo "$TIME_TOTAL / 86400" | bc)
    local dt2=$(echo "$TIME_TOTAL - 86400 * $dd" | bc)
    echo "dt2: $dt2"
    local dh=$(echo "$dt2 / 3600" | bc)
    echo "dh: $dh"
    local dt3=$(echo "$dt2 - 3600 * $dh" | bc)
    echo "dt3: $dt3"
    EXECUTION_TIME_MINUTES=$(echo "$dt3 / 60" | bc)
    EXECUTION_TIME_SECONDS=$(echo "$dt3 - 60 * $EXECUTION_TIME_MINUTES" | bc)

    # Show command execution time
    if [ "$SHOW_COMMAND_EXECUTION_TIME" == "true" ]; then
        printf "${CYAN}Execution Time:${NC} \e[3m%0.2fs\e[0m\n" $EXECUTION_TIME_SECONDS
    fi

    # Show success/fail message
    if [ "$SUCCESS" == 'true' ]; then
        green_text 'Success!'
    else
        echo -e "Failed: $COMMAND\n\n" >> $ERROR_LOG_PATH

        if [ $COMMAND_EXIT_CODE -eq 0 ]; then
            red_text "Fail!"
        else
            red_text "Fail! ($COMMAND_EXIT_CODE)"
        fi
    fi

    # Print new line
    line_break
}
