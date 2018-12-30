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
    local command_output=`eval $command`
    local command_exit_code=$?

    # Save command ouput to log file
    echo -e "\nOutput:\n$command_output" >> $LOG_FILE_PATH
    echo -e "\n$LOG_LINE_SEPARATOR\n" >> $LOG_FILE_PATH

    if [ $command_exit_code -eq 0 ]; then # Command executed successfully
        success=true

        # Print command ouput
        [ "$SHOW_COMMAND_OUTPUT" == "true" ] && echo $command_output

        # Update provisioning stats file
        update_provisioning_stats success

        NUM_SUCCESSFUL=$((NUM_SUCCESSFUL+1))
    else # Command failed
        update_provisioning_stats error

        NUM_ERRORS=$((NUM_ERRORS+1))
    fi

    # Calculate total execution time
    if [ "$PROVISION_SHOW_COMMAND_EXECUTION_TIME" == "true" ]; then
        local end_time=$(date +%s.%N)
        local time_total=$(echo "$end_time - $start_time" | bc)

        local dd=$(echo "$time_total / 86400" | bc)
        local dt2=$(echo "$time_total - 86400 * $dd" | bc)
        local dh=$(echo "$dt2 / 3600" | bc)
        local dt3=$(echo "$dt2 - 3600 * $dh" | bc)

        local execution_time_in_minutes=$(echo "$dt3 / 60" | bc)
        local execution_time_in_seconds=$(echo "$dt3 - 60 * $execution_time_in_minutes" | bc)

        # Show command execution time
        [ "$PROVISION_SHOW_COMMAND" == "true" ] && printf "${CYAN}Execution Time:${NC} \e[3m%0.2fs\e[0m\n" $execution_time_in_seconds
    fi

    # Show success/fail message
    if [ "$PROVISION_SHOW_COMMAND" == "true" ]; then
        if [ "$success" == "true" ]; then
            green_text 'Success!'
        else
            # Save to error log file
            echo -e "Command:\n$command\nOutput:\n$command_output\n$LOG_LINE_SEPARATOR\n\n" >> $ERROR_LOG_PATH

            if [ "$PROVISION_SHOW_COMMAND_EXIT_CODE" == "true" ]; then
                red_text "Fail! ($command_exit_code)"
            else
                red_text "Fail!"
            fi
        fi

        # Print new line
        line_break
    fi
}
