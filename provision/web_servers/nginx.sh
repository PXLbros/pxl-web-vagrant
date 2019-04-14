#!/bin/bash

export LOG_FILE_PATH=web_servers/nginx.log

. /vagrant/provision/helpers/include.sh

if [ "$NGINX_ENABLED" == "true" ]; then
    title "NGINX"

    if ! grep -qF "export NGINX_PORT_HTTP" /home/vagrant/.bashrc; then
        exec_command "echo -e \"\nexport NGINX_PORT_HTTP=$NGINX_PORT_HTTP\" >> /home/vagrant/.bashrc"
    fi

    if ! grep -qF "export NGINX_PORT_HTTPS" /home/vagrant/.bashrc; then
        exec_command "echo -e \"\nexport NGINX_PORT_HTTPS=$NGINX_PORT_HTTPS\" >> /home/vagrant/.bashrc"
    fi

    # Install NGINX
    highlight_text "Install NGINX..."
    exec_command "sudo apt-get install nginx -y"

    if [ -x "$(command -v nginx)" ]; then
        # Give Vagrant permission to edit NGINX site configuration files
        highlight_text "Give Vagrant user permission to NGINX /etc/nginx/sites-available directory..."
        exec_command "sudo chown -R vagrant:vagrant /etc/nginx/sites-available"

        # Update port in default site
        if [ "$NGINX_PORT_HTTP" != "80" ]; then
            if [ ! -z "$PORT" ]; then
                exec_command "sed -i \"s/80/$PORT/g\" /etc/nginx/sites-available/default"
            fi
        fi

        # Restart NGINX
        highlight_text "Restart NGINX..."
        exec_command "sudo service nginx start"
    fi
else
    if [ -x "$(command -v nginx)" ]; then
        title "NGINX"

        highlight_text "Uninstall NGINX..."

        # Stop NGINX
        exec_command "sudo service nginx stop"

        # Uninstall NGINX
        exec_command "sudo apt-get remove -y nginx nginx-common"
        exec_command "sudo apt-get autoremove -y"
    fi
fi
