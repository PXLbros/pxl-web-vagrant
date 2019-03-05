#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

exec_command() {
    local command=$*

    # Create log directory if not exist
    [[ ! -d $LOG_DIR ]] && sudo mkdir -p $(dirname "${LOG_FILE_PATH}")

    # Save to log file
    echo -e "Command:\n$command" >> $LOG_FILE_PATH

    # Show command to execute
    [ "$PROVISION_SHOW_COMMAND" == "true" ] && blue_text "\$ $command"

    local success=false

    local start_time=$(date +%s.%N)

    # Execute command
    if [ "$PROVISION_SHOW_COMMAND_OUTPUT" == "true" ]; then
        eval "$command" | tee $PROVISIONING_COMMAND_FILE_PATH
    else
        eval "$command" &> $PROVISIONING_COMMAND_FILE_PATH
    fi

    local command_exit_code=$?
    local command_output=$(cat $PROVISIONING_COMMAND_FILE_PATH)

    # Save command ouput to log file
    echo -e "\nOutput:\n$command_output" >> $LOG_FILE_PATH

    if [ $command_exit_code -eq 0 ]; then # Command executed successfully
        success=true

        # Update provisioning stats file
        update_provisioning_stats success

        NUM_SUCCESSFUL=$((NUM_SUCCESSFUL+1))
    else # Command failed
        update_provisioning_stats error

        NUM_ERRORS=$((NUM_ERRORS+1))

        # Abort on error
        if [ "$PROVISION_ABORT_ON_ERROR" == "true" ]; then
            echo "Aborted due to error."

            exit $command_exit_code
        fi
    fi

    # Calculate total execution time
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
        [ "$PROVISION_SHOW_COMMAND" == "true" ] && printf "${CYAN}Execution Time:${NC} \e[3m%0.2fs\e[0m\n" $execution_time_in_seconds
    fi

    # Save execution time to log file
    printf "\nExecution Time: %0.2fs\n" $execution_time_in_seconds >> $LOG_FILE_PATH

    # Save exit code to log file
    echo -e "Exit Code: $command_exit_code" >> $LOG_FILE_PATH

    # Show success/fail message
    if [ "$PROVISION_SHOW_COMMAND" == "true" ]; then
        if [ "$success" == "true" ]; then
            green_text "Success!"
        else
            # Save to error log file
            printf "Log: $LOG_FILE_PATH\n\nCommand:\n$command\n\nOutput:\n$command_output\n\n\nExecution Time: %0.2fs\nExit Code: $command_exit_code\n\n$LOG_LINE_SEPARATOR\n\n" >> $ERROR_LOG_PATH

            if [ "$PROVISION_SHOW_COMMAND_EXIT_CODE" == "true" ]; then
                red_text "Fail! ($command_exit_code)"
            else
                red_text "Fail!"
            fi
        fi

        # Print new line
        line_break
    fi

    echo -e "\n$LOG_LINE_SEPARATOR\n" >> $LOG_FILE_PATH
}

add_ppa() {
    for i in "$@"; do
        grep -h "^deb.*$i" /etc/apt/sources.list.d/* > /dev/null 2>&1

        if [ $? -ne 0 ]; then
            highlight_text "Adding ppa:$i"

            exec_command "sudo add-apt-repository -y ppa:$i"
        fi
    done
}
