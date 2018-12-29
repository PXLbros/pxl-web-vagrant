update_provisioning_stats() {
    RESULT=$1

    if [ -f $TMP_PROVISIONING_FILE_PATH ];
    then
        FILE_CONTENTS=`cat $TMP_PROVISIONING_FILE_PATH`
    else
        FILE_CONTENTS="0;0"
    fi

    RESULTS=(${FILE_CONTENTS//;/ })

    NUM_SUCCESSFUL=${RESULTS[0]}
    NUM_ERRORS=${RESULTS[1]}

    if [ "$RESULT" == "success" ];
    then
        NUM_SUCCESSFUL=$((NUM_SUCCESSFUL + 1))
    elif [ "$RESULT" == "error" ];
    then
        NUM_ERRORS=$((NUM_ERRORS + 1))
    fi

    echo "$NUM_SUCCESSFUL;$NUM_ERRORS" > $TMP_PROVISIONING_FILE_PATH
}

reset_provisioning_stats() {
    echo '0;0' > $TMP_PROVISIONING_FILE_PATH
}

print_provisioning_stats() {
    if [ ! -f $TMP_PROVISIONING_FILE_PATH ];
    then
        exit 0
    fi

    FILE_CONTENTS=`cat $TMP_PROVISIONING_FILE_PATH`
    RESULTS=(${FILE_CONTENTS//;/ })

    NUM_SUCCESSFUL=${RESULTS[0]}
    NUM_ERRORS=${RESULTS[1]}
    NUM_TOTAL=$((NUM_SUCCESSFUL + NUM_ERRORS))

    if (( NUM_ERRORS > 0 ));
    then
        error_text "There were $NUM_ERRORS errors of $NUM_TOTAL total commands."
        error_text "See logs/ folder for more details."
    else
        yellow_text "\nPXL Web Vagrant was provisioned successfully! Start by running command \"vagrant ssh\"."
    fi
}

debug_command() {
    COMMAND=$*

    NUM_TOTAL=$((NUM_TOTAL+1))

    # echo "NUM_TOTAL: $NUM_TOTAL"

    ERROR_LOG_PATH=/vagrant/logs/errors.log

    if [ -z "$LOG_FILE_PATH" ];
    then
        LOG_PATH=/vagrant/logs/provision.log
    else
        LOG_PATH=$LOG_FILE_PATH
    fi

    LOG_PATH_DIR=$(dirname "${LOG_PATH}")

    sudo mkdir -p $LOG_PATH_DIR

    echo -e "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n$COMMAND\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n" >> $LOG_PATH

    if [ "$SHOW_COMMAND" == "true" ]; then blue_text "\$ $COMMAND"; fi

    SUCCESS=false
    START_TIME=$(date +%s.%N)

    # Execute command
    if [ "$SHOW_COMMAND_OUTPUT" == "true" ];
    then
        # Show command output
        if eval "$COMMAND" | tee $LOG_PATH; then SUCCESS=true; fi
    else
        # Hide command output
        if eval "$COMMAND" &>> $LOG_PATH; then SUCCESS=true; fi
    fi

    COMMAND_EXIT_CODE=$?

    if [ "$SUCCESS" == "true" ];
    then
        update_provisioning_stats success

        NUM_SUCCESSFUL=$((NUM_SUCCESSFUL+1))
    else
        update_provisioning_stats error

        NUM_ERRORS=$((NUM_ERRORS+1))
    fi

    END_TIME=$(date +%s.%N)
    TIME_TOTAL=$(echo "$END_TIME - $START_TIME" | bc)
    dd=$(echo "$TIME_TOTAL / 86400" | bc)
    dt2=$(echo "$TIME_TOTAL - 86400 * $dd" | bc)
    dh=$(echo "$dt2 / 3600" | bc)
    dt3=$(echo "$dt2 - 3600 * $dh" | bc)
    EXECUTION_TIME_MINUTES=$(echo "$dt3 / 60" | bc)
    EXECUTION_TIME_SECONDS=$(echo "$dt3 - 60 * $EXECUTION_TIME_MINUTES" | bc)

    # Show command execution time
    if [ "$SHOW_COMMAND_EXECUTION_TIME" == "true" ];
    then
        printf "${CYAN}Execution Time:${NC} \e[3m%0.2fs\e[0m\n" $EXECUTION_TIME_SECONDS
    fi

    # Show success/fail message
    if [ "$SUCCESS" == 'true' ];
    then
        green_text 'Success!'
    else
        echo -e "Failed: $COMMAND\n\n" >> $ERROR_LOG_PATH

        if [ $COMMAND_EXIT_CODE -eq 0 ];
        then
            red_text "Fail!"
        else
            red_text "Fail! ($COMMAND_EXIT_CODE)"
        fi
    fi

    # Make a new line break
    echo -e " "
}
