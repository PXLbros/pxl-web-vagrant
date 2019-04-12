# PXL Web Vagrant

Welcome to **PXL Web Vagrant** - a Vagrant environment for Web development.

* Open source :100:
    * Help make **PXL Web Vagrant** better ([GitHub](https://github.com/PXLbros/pxl-web-vagrant/CONTRIBUTE.md))
* Easy powerful configuration through [`config.yaml`](/configuration.html#config-yaml)
* Ubuntu 18.04
* PHP
    * Version 5.6 & 7.0-7.3
    * Support for running multiple versions simultaneously
    * Caching with Memcached/Redis/APC
* Web servers
    * Apache
    * NGINX
    * Built-in helper commands for managing virtual host configurations, e.g. [`edit_site_conf`](/web-servers/#edit-site-conf)
* Databases
    * MySQL
    * Built-in helper commands for creating and deleting databases, .e.g [`create_database`](/databases/commands.html#create-database) and [`delete_database`](/databases/commands.html#delete-database)
* Shell
    * LiquidPrompt
    * tmux
        * tmuxinator
* Backup/restore
