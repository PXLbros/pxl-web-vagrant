# PXL Web Vagrant

Welcome to **PXL Web Vagrant** - a Ubuntu Vagrant environment for web development.

* Open source :100:
    * Help make **PXL Web Vagrant** better. ([GitHub](https://github.com/PXLbros/pxl-web-vagrant/CONTRIBUTE.md))
* Easy powerful configuration through [`config.yaml`](/configuration.html#config-yaml)
* PHP
    * Version 5.6 & 7.0-7.3
    * Support for multiple versions running simultaneously
    * Caching with Memcached and APC
* Node.js
* Web servers
    * Apache
    * NGINX
    * Built-in helper commands for managing virtual host configurations, e.g. [`create_apache_site`](/web-servers/apache.html#create-apache-site) and [`edit_nginx_site`](/web-servers/nginx.html#edit-nginx-site)
* Databases
    * MySQL
    * MongoDB
    * Built-in helper commands for creating and deleting databases, .e.g [`create_database`](/databases/#create) and [`delete_database`](/databases/#delete)
* Caching
    * Redis
* Shell
    * LiquidPrompt
    * tmux
        * tmuxinator
* Other
    * Support for custom Vagrant provisioning scripts
