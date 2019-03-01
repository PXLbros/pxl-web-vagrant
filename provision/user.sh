#!/bin/bash

export LOG_FILE_PATH=user.log

. /vagrant/provision/helpers/include.sh

title "User Provision"

PROVISION_USER_DIR="/vagrant/provision/user"
USER_BASH_PROFILE_PATH="$PROVISION_USER_DIR/.bash_profile"
USER_TMUX_CONF_PATH="$PROVISION_USER_DIR/.tmux.conf"

# Run user bash scripts
for file in "$PROVISION_USER_DIR/*.sh"; do
    [ ! -f "$file" ] || break

    USER_SCRIPT_FILENAME="$(basename -- $file)"

    chmod +x $file

    highlight_text "Run user script ($USER_SCRIPT_FILENAME)..."

    # Execute
    $file

    line_break
done

# .bash_profile
if [ -f "$USER_BASH_PROFILE_PATH" ]; then
    USER_BASH_PROFILE_CONTENTS=$(cat $USER_BASH_PROFILE_PATH)

    highlight_text "Copy user .bash_profile..."

    exec_command "echo -e \"\n# User\n\$USER_BASH_PROFILE_CONTENTS\" >> \$HOME/.bash_profile"
    exec_command "source \$HOME/.bash_profile"
fi

# .tmux.conf
if [ -f "$USER_TMUX_CONF_PATH" ]; then
    USER_TMUX_CONF_CONTENTS=$(cat $USER_TMUX_CONF_PATH)

    highlight_text "Copy user tmux configuration..."

    if ! grep -qF "# User" $HOME/.tmux.conf.local; then
        exec_command "echo -e \"\n# User\n$USER_TMUX_CONF_CONTENTS\" >> \$HOME/.tmux.conf.local"
    fi

    # exec_command "tmux source-file $HOME/.tmux.conf.local"
fi
