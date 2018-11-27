#!/bin/bash

DEBUG=1

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
