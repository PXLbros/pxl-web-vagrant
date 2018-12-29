#!/bin/bash

TMP_PROVISIONING_FILE_PATH=/vagrant/.provisioning
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

init_provisioning_stats() {
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
        highlight_text "\nPXL Web Vagrant has been provisioned."
        highlight_text "Start by running command \"vagrant ssh\"."
    fi
}

clear_provisioning_stats() {
    rm $TMP_PROVISIONING_FILE_PATH
}

debug_command() {
    local command=$*

    # If no LOG_FILE_PATH specified
    if [ -z "$LOG_FILE_PATH" ]; then
        local log_path=/vagrant/logs/provision.log
    else
        local log_path="$PROVISION_LOG_DIR/$LOG_FILE_PATH"
    fi

    local log_path_dir=$(dirname "${log_path}")

    # Create log directory if not exist
    sudo mkdir -p $log_path_dir

    # Save to log file
    echo -e "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n"  >> $log_path
    echo -e $command >> $log_path
    echo -e "\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n" >> $log_path

    # Show command to execute
    if [ "$PROVISION_SHOW_COMMAND" == "true" ]; then
        blue_text "\$ $command";
    fi

    local success=false

    local start_time=$(date +%s.%N)

    # Execute command
    # local command_output=$($command)

    if [ "$SHOW_COMMAND_OUTPUT" == "true" ]; then
        # Show command output
        if eval "$command" | tee $log_path; then success=true; fi
    else
        # Hide command output
        if eval "$command" &>> $log_path; then success=true; fi
    fi

    local command_exit_code=$?

    if [ "$success" == "true" ]; then
        update_provisioning_stats success

        NUM_SUCCESSFUL=$((NUM_SUCCESSFUL+1))
    else
        update_provisioning_stats error

        NUM_ERRORS=$((NUM_ERRORS+1))
    fi

    local end_time=$(date +%s.%N)
    local time_total=$(echo "$end_time - $start_time" | bc)

    local dd=$(echo "$time_total / 86400" | bc)
    local dt2=$(echo "$time_total - 86400 * $dd" | bc)
    local dh=$(echo "$dt2 / 3600" | bc)
    local dt3=$(echo "$dt2 - 3600 * $dh" | bc)

    local execution_time_in_minutes=$(echo "$dt3 / 60" | bc)
    local execution_time_in_seconds=$(echo "$dt3 - 60 * $execution_time_in_minutes" | bc)

    # Show command execution time
    if [ "$PROVISION_SHOW_COMMAND_EXECUTION_TIME" == "true" ]; then
        printf "${CYAN}Execution Time:${NC} \e[3m%0.2fs\e[0m\n" $execution_time_in_seconds
    fi

    # Show success/fail message
    if [ "$PROVISION_SHOW_COMMAND" == "true" ]; then
        if [ "$success" == "true" ]; then
            green_text 'Success!'
        else
            # Save to error log file
            echo -e "$command\n\n" >> $ERROR_LOG_PATH

            if [ "$PROVISION_SHOW_COMMAND_EXIT_CODE" == "true" ]; then
                if [ $command_exit_code -eq 0 ]; then
                    red_text "Fail!"
                else
                    red_text "Fail! ($command_exit_code)"
                fi
            else
                red_text "Fail!"
            fi
        fi

        # Print new line
        line_break
    fi
}
