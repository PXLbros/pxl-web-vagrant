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
    * Built-in helper commands for managing site virtual host configurations, e.g. [`edit_site_conf`](/web-servers/#edit-site-conf) and [`delete_site_conf`](/web-servers/#delete-site-conf) 
* Databases
    * MySQL (phpMyAdmin)
    * Built-in helper commands for creating and deleting databases, .e.g [`create_database`](/databases/commands.html#create-database) and [`delete_database`](/databases/commands.html#delete-database)
* Projects
    * Built-in helper commands for creating projects from Git repository
    * Get started with new projects fast boilerplates (.e.g `create_project --boilerplate laravel`)
    * Setup installation instructions with project based `.pxl/install.js` file that are run upon `create_project` command (.e.g run Composer and create `.env` file, [`see example`](/))
* Boilerplates
    * Common built-in boilerplates
        * Laravel PHP Framework
        * WordPress
        * Slim PHP Framework
        * Vue.js
        * Ember.js
    * Create your own boilerplates
* Shell
    * LiquidPrompt
    * tmux
        * tmuxinator
* Backup/restore settings, site virtual host configurations and databases
* Share environment easily
