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
    echo '0;0' > $PROVISIONING_STATS_FILE_PATH
}

print_provisioning_stats() {
    if [ ! -f $PROVISIONING_STATS_FILE_PATH ]; then
        exit 0
    fi

    local file_contents=`cat $PROVISIONING_STATS_FILE_PATH`
    local results=(${FILE_CONTENTS//;/ })

    local num_successful=${results[0]}
    local num_errors=${results[1]}
    local num_total=$((num_successful + num_errors))

    if (( num_total > 0 )); then
        error_text "There were $num_errors errors of $num_total total commands."
        error_text "See logs/ folder for more details."
    else
        highlight_text "\nPXL Web Vagrant has been provisioned.\nStart by running command \"vagrant ssh\"."
    fi
}

clear_provisioning_stats() {
    rm -rf $PROVISIONING_STATS_FILE_PATH
}
