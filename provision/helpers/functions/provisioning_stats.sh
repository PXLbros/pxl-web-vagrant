#!/bin/bash

update_provisioning_stats() {
    local result=$1

    if [ -f $PROVISIONING_STATS_FILE_PATH ]; then
        local file_contents=`cat $PROVISIONING_STATS_FILE_PATH`
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

    echo "$num_successful;$num_errors" > $PROVISIONING_STATS_FILE_PATH
}

init_provisioning_stats() {
    local start_time=$(date +%s.%N)

    echo "0;0;$start_time" > $PROVISIONING_STATS_FILE_PATH
}

print_provisioning_stats() {
    if [ ! -f $PROVISIONING_STATS_FILE_PATH ]; then
        exit 0
    fi

    local file_contents=`cat $PROVISIONING_STATS_FILE_PATH`
    local results=(${file_contents//;/ })

    local num_successful=${results[0]}
    local num_errors=${results[1]}
    local num_total=$((num_successful + num_errors))

    if [ "$num_errors" == "1" ]; then
        local was_word="was"
        local error_word="error"
    else
        local was_word="were"
        local error_word="errors"
    fi

    # Calculate total execution time
    local start_time=${results[2]}
    local end_time=$(date +%s.%N)
    local time_total=$(echo "$end_time - $start_time" | bc)

    local dd=$(echo "$time_total / 86400" | bc)
    local dt2=$(echo "$time_total - 86400 * $dd" | bc)
    local dh=$(echo "$dt2 / 3600" | bc)
    local dt3=$(echo "$dt2 - 3600 * $dh" | bc)

    local execution_time_in_minutes=$(echo "$dt3 / 60" | bc)
    local execution_time_in_seconds=$(echo "$dt3 - 60 * $execution_time_in_minutes" | bc)

    if (( num_errors > 0 )); then
        error_text "There $was_word $num_errors $error_word of $num_total total commands."
        error_text "See logs/ folder for more details."
    else
        highlight_text "\nPXL Web Vagrant has been provisioned.\n"
        
        cyan_text "Name: ${VAGRANT_NAME}"
        cyan_text "IP: ${IP_ADDRESS}"

        line_break
        
        echo "Start by running command \"vagrant ssh\"."
    fi

    printf "Execution Time: \e[3m%0.2fs\e[0m\n" $execution_time_in_seconds
}

clear_provisioning_stats() {
    rm -rf $PROVISIONING_STATS_FILE_PATH
}
