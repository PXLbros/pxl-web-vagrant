# -*- mode: ruby -*-
# vi: set ft=ruby :

require 'yaml'
require 'json'

VAGRANTFILE_API_VERSION ||= '2'
VAGRANT_DIR = File.dirname(File.expand_path(__FILE__))

#require "#{VAGRANT_DIR}/libs/deep_merge/deep_merge_hash.rb"

# Get default config
default_config_path = "#{VAGRANT_DIR}/config.default.yaml"
user_config_path = "#{VAGRANT_DIR}/config.yaml"

default_config = YAML.load_file(default_config_path)

# Get user config and merge with default config
if File.exist? "#{VAGRANT_DIR}/config.yaml" then
    user_config = YAML.load_file("#{VAGRANT_DIR}/config.yaml")

    vagrant_config = default_config.merge(user_config)
    #vagrant_config = default_config.deep_merge!(user_config)
else
    vagrant_config = default_config
end

# Read package.json
package_json = JSON.parse(File.read("#{VAGRANT_DIR}/package.json"))

VERSION = package_json['version']
BUILD_DATE = `git log -1 --format=%cd | tr -d '\n'`

# Read user .gitconfig
user_gitconfig = Pathname.new("#{Dir.home}/.gitconfig")

# Set global variables
GLOBAL_VARIABLES = {
    'VERSION': VERSION,
    'BUILD_DATE': BUILD_DATE,

    'LANGUAGE': "#{vagrant_config['vm']['locale']['language-iso']}.UTF-8",
    'LANG': "#{vagrant_config['vm']['locale']['language-iso']}.UTF-8",
    'LC_ALL': "#{vagrant_config['vm']['locale']['language-iso']}.UTF-8",

    'VAGRANT_NAME': vagrant_config['vm']['name'],
    'IP_ADDRESS': vagrant_config['vm']['ip'],
    'TIMEZONE': vagrant_config['vm']['locale']['timezone'],

    'HOME_DIR': vagrant_config['vm']['home-dir'],
    'PROJECTS_DIR': vagrant_config['vm']['projects-dir'],

    'PROVISION_SHOW_COMMAND': vagrant_config['vm']['provision']['show-command'],
    'PROVISION_SHOW_COMMAND_OUTPUT': vagrant_config['vm']['provision']['show-command-output'],
    'PROVISION_SHOW_COMMAND_EXECUTION_TIME': vagrant_config['vm']['provision']['show-command-execution-time'],
    'PROVISION_SHOW_COMMAND_EXIT_CODE': vagrant_config['vm']['provision']['show-command-exit-code'],
    'PROVISION_ABORT_ON_ERROR': vagrant_config['vm']['provision']['abort-on-error'],
    'PROVISION_UPGRADE_APT': vagrant_config['vm']['provision']['upgrade-apt'],

    'APACHE_ENABLED': vagrant_config['web-servers']['apache']['enabled'],
    'NGINX_ENABLED': vagrant_config['web-servers']['nginx']['enabled'],
    
    'MYSQL_ENABLED': vagrant_config['databases']['mysql']['enabled'],
    'MYSQL_VERSION': vagrant_config['databases']['mysql']['version'],

    'PHPMYADMIN': vagrant_config['databases']['mysql']['phpmyadmin'],

    'POSTGREQSQL_ENABLED': vagrant_config['databases']['postgresql']['enabled'],

    'TMUX_VERSION': (vagrant_config['shell']['tmux']['version'] || '2.8'),
    'TMUXINATOR': (vagrant_config['shell']['tmux']['tmuxinator']['enabled'] || false),
    'TMUXINATOR_AUTO_START': (vagrant_config['shell']['tmux']['tmuxinator']['auto-start'] || ''),
    'GPAKOSZ': (vagrant_config['shell']['tmux']['gpakosz']['enabled'] || false),

    'PHP_VERSIONS': (vagrant_config['code']['php']['versions'] ? vagrant_config['code']['php']['versions'].join(' ') : nil),
    'PHP_USER_MODULES': (vagrant_config['code']['php']['modules'] ? vagrant_config['code']['php']['modules'].join(' ') : ''),

    'MEMCACHED': (vagrant_config['code']['php']['cache']['memcached']['enabled'] ? true : false),
    'APC': (vagrant_config['code']['php']['cache']['apc']['enabled'] ? true : false),

    # 'XDEBUG': (vagrant_config['code']['php']['xdebug']['enabled'] || false),

    'USER_GIT_CONFIG': user_gitconfig
}

Vagrant.require_version '>= 2.1.0'

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
    # Validate
    if vagrant_config['vm']['name'].empty?
        puts 'Vagrant name must not be empty.'
        exit
    end

    # Configure Vagrant
    config.vm.define vagrant_config['vm']['name']
    config.vm.box = 'bento/ubuntu-18.04'

    # Set static IP
    if !vagrant_config['vm']['ip'].empty?
        config.vm.network :private_network, ip: vagrant_config['vm']['ip']
    end

    # config.vm.synced_folder '.', '/vagrant', nfs: true
    # config.vm.synced_folder '.', '/var/www', :mount_options => [
    #     'dmode=777',
    #     'fmode=666'
    # ]

    # config.vm.synced_folder '.', '/var/www', :nfs => { :mount_options => [ 'dmode=777', 'fmode=666', 'vers=3', 'tcp', 'fsc' ,'actimeo=2' ] }

    # SSH configuration
    config.ssh.forward_agent = true

    # Calculate memory
    memory = vagrant_config['vm']['memory']

    if vagrant_config['vm']['memory'] == 'auto'
        host = RbConfig::CONFIG['host_os']

        # Give VM 1/4 system memory
        if host =~ /darwin/
            mem = `sysctl -n hw.memsize`.to_i / 1024
        elsif host =~ /linux/
            mem = `grep 'MemTotal' /proc/meminfo | sed -e 's/MemTotal://' -e 's/ kB//'`.to_i 
        elsif host =~ /mswin|mingw|cygwin/
            mem = `wmic computersystem Get TotalPhysicalMemory`.split[1].to_i / 1024
        end

        memory = mem / 1024 / 4
    else
        memory = vagrant_config['vm']['memory']
    end

    # Configure VirtualBox
    config.vm.provider 'virtualbox' do |vb|
        vb.customize ['modifyvm', :id, '--memory', memory ||= 1024]
        vb.customize ['modifyvm', :id, '--cpus', vagrant_config['vm']['cpus'] ||= 1]

        vb.customize ['modifyvm', :id, '--natdnshostresolver1', vagrant_config['vm']['natdnshostresolver'] ||= 'on']
        vb.customize ['modifyvm', :id, '--natdnsproxy1', vagrant_config['vm']['natdnsproxy'] ||= 'on']

        vb.customize ['modifyvm', :id, '--ioapic', 'on']
    end

    # Install Vagrant core
    config.vm.provision 'shell', name: 'Initialize', path: "#{VAGRANT_DIR}/provision/initialize.sh", privileged: true, run: 'once', env: GLOBAL_VARIABLES
    
    # Welcome message
    config.vm.provision 'shell', name: 'Welcome Message', path: "#{VAGRANT_DIR}/provision/shell/welcome-message.sh", privileged: true, run: 'once', env: GLOBAL_VARIABLES

    # .bash_profile
    config.vm.provision 'shell', name: '.bash_profile', path: "#{VAGRANT_DIR}/provision/shell/bash_profile.sh", privileged: false, run: 'once', env: GLOBAL_VARIABLES

    # Git
    gitconfig = Pathname.new("#{Dir.home}/.gitconfig")
    config.vm.provision 'shell', name: 'Git', :inline => "echo -e '#{gitconfig.read()}' > '/home/vagrant/.gitconfig'", privileged: false, env: GLOBAL_VARIABLES if gitconfig.exist?
    config.vm.provision 'shell', name: 'Node', path: "#{VAGRANT_DIR}/provision/code/git.sh", run: 'once', privileged: false, env: GLOBAL_VARIABLES

    # Node
    config.vm.provision 'shell', name: 'Node', path: "#{VAGRANT_DIR}/provision/code/node.sh", run: 'once', privileged: false, env: GLOBAL_VARIABLES

    # Yarn
    config.vm.provision 'shell', name: 'Yarn', path: "#{VAGRANT_DIR}/provision/code/yarn.sh", run: 'once', privileged: false, env: GLOBAL_VARIABLES

    # Vim
    config.vm.provision 'shell', name: 'Vim', path: "#{VAGRANT_DIR}/provision/shell/vim.sh", run: 'once', privileged: false, env: GLOBAL_VARIABLES

    # tmux
    if vagrant_config['shell']['tmux']['enabled']
        config.vm.provision 'shell', name: 'tmux', path: "#{VAGRANT_DIR}/provision/shell/tmux/tmux.sh", run: 'once', privileged: false, env: GLOBAL_VARIABLES
        # config.vm.provision 'shell', name: 'tmux-resurrect', path: "#{VAGRANT_DIR}/provision/shell/tmux/tmux-resurrect.sh", run: 'once', privileged: false, env: GLOBAL_VARIABLES

        # tmuxinator
        if vagrant_config['shell']['tmux']['tmuxinator']['enabled']
            config.vm.provision 'shell', name: 'tmuxinator', path: "#{VAGRANT_DIR}/provision/shell/tmux/tmuxinator.sh", run: 'once', privileged: false, env: GLOBAL_VARIABLES
        end
    end

    # Liquid Prompt
    if vagrant_config['shell']['liquidprompt']['enabled']
        config.vm.provision 'shell', name: 'Liquid Prompt', path: "#{VAGRANT_DIR}/provision/shell/liquidprompt.sh", run: 'once', privileged: false, env: GLOBAL_VARIABLES
    end

    # LNAV
    config.vm.provision 'shell', name: 'LNAV', path: "#{VAGRANT_DIR}/provision/shell/lnav.sh", run: 'once', privileged: false, env: GLOBAL_VARIABLES

    # Install web servers
    if vagrant_config.has_key?('web-servers')
        web_server_port_http_in = 80
        web_server_port_https_in = 443

        vagrant_config['web-servers'].each do |web_server_name, web_server_vagrant_config|
            if web_server_name === 'apache'
                port_http_out = (web_server_vagrant_config['port']['http'] || (web_server_vagrant_config['port'] || 7001))
                port_https_out = (web_server_vagrant_config['port']['https'] || 7002)

                GLOBAL_VARIABLES['APACHE_PORT_HTTP'] = web_server_port_http_in
                GLOBAL_VARIABLES['APACHE_PORT_HTTPS'] = web_server_port_https_in
                GLOBAL_VARIABLES['APACHE_PORT_HTTP_OUT'] = port_http_out
                GLOBAL_VARIABLES['APACHE_PORT_HTTPS_OUT'] = port_https_out
            elsif web_server_name === 'nginx'
                port_http_out = (web_server_vagrant_config['port']['http'] || (web_server_vagrant_config['port'] || 8001))
                port_https_out = (web_server_vagrant_config['port']['https'] || 8002)

                GLOBAL_VARIABLES['NGINX_PORT_HTTP'] = web_server_port_http_in
                GLOBAL_VARIABLES['NGINX_PORT_HTTPS'] = web_server_port_https_in
                GLOBAL_VARIABLES['NGINX_PORT_HTTP_OUT'] = port_http_out
                GLOBAL_VARIABLES['NGINX_PORT_HTTPS_OUT'] = port_https_out
            end

            # Install web server
            config.vm.provision 'shell', name: "Web Server: #{web_server_name}", path: "#{VAGRANT_DIR}/provision/web_servers/#{web_server_name}.sh", privileged: false, run: 'once', env: GLOBAL_VARIABLES

            # Bind web server port
            config.vm.network :forwarded_port, guest: web_server_port_http_in, host: port_http_out
            config.vm.network :forwarded_port, guest: web_server_port_https_in, host: port_https_out

            # Increment port number
            web_server_port_http_in += 1
            web_server_port_https_in += 1
        end
    end

    # PHP
    if vagrant_config['code']['php']['versions']
        if vagrant_config['code']['php']['versions'].any?
            # Install PHP
            config.vm.provision 'shell', name: 'PHP', path: "#{VAGRANT_DIR}/provision/code/php/php.sh", privileged: true, run: 'once', env: GLOBAL_VARIABLES

            # Memcached
            if vagrant_config['code']['php']['cache']['memcached']['enabled']
                # Install Memcached
                config.vm.provision 'shell', name: "Memcached", path: "#{VAGRANT_DIR}/provision/code/php/cache/memcached.sh", privileged: true, env: GLOBAL_VARIABLES, run: 'once'
            end

            # APC
            if vagrant_config['code']['php']['cache']['apc']['enabled']
                # Install APC
                config.vm.provision 'shell', name: "APC", path: "#{VAGRANT_DIR}/provision/code/php/cache/apc.sh", privileged: true, env: GLOBAL_VARIABLES, run: 'once'
            end

            # Xdebug
            # if vagrant_config['code']['php']['xdebug']['enabled']
                # Install Xdebug
                # config.vm.provision 'shell', name: "Xdebug", path: "#{VAGRANT_DIR}/provision/code/php/xdebug.sh", privileged: true, env: GLOBAL_VARIABLES, run: 'once'
            # end
        end
    end

    # Install databases
    vagrant_config['databases'].each do |database_name, database_vagrant_config|
        if database_vagrant_config['enabled'] == true
            # Install database
            config.vm.provision 'shell', name: "Database: #{database_name}", path: "#{VAGRANT_DIR}/provision/databases/#{database_name}.sh", privileged: true, env: GLOBAL_VARIABLES, run: 'once'
        end
    end

    # Redis
    if vagrant_config['cache']['redis']['enabled']
        # Install Redis
        config.vm.provision 'shell', name: "Redis", path: "#{VAGRANT_DIR}/provision/cache/redis.sh", privileged: true, env: GLOBAL_VARIABLES, run: 'once'
    end

    # Run user provision scripts (TODO: do this in user.sh instead)
    Dir.glob("#{VAGRANT_DIR}/provision/user/*.sh").each do |user_file_path|
        config.vm.provision 'shell', name: "User Script (#{user_file_path})", path: user_file_path, privileged: false, env: GLOBAL_VARIABLES, run: 'once'
    end

    # User script
    config.vm.provision 'shell', name: 'User Script', path: "#{VAGRANT_DIR}/provision/user.sh", privileged: false, env: GLOBAL_VARIABLES, run: 'once'

    # Finalize
    config.vm.provision 'shell', name: 'Finalize', path: "#{VAGRANT_DIR}/provision/finalize.sh", privileged: false, env: GLOBAL_VARIABLES, run: 'once'

    # Restore backup
    # ...

    # Copy SSH keys from host to guest
    config.vm.provision 'file', source: '~/.ssh/id_rsa.pub', destination: '~/.ssh/id_rsa.pub'
    config.vm.provision 'shell', inline: 'cat ~vagrant/.ssh/id_rsa.pub >> ~vagrant/.ssh/authorized_keys'
    
    # Before destroy
    config.trigger.before :destroy do |trigger|
        # puts "Before destroy..."

        # Backup
        if vagrant_config['vm']['backup-on-destroy']
            # puts "Backup..."
            
            # trigger.warn = "Backing up..."
            # trigger.run_remote = { inline: 'echo "hey"' }
        end
    end

    config.vm.network "forwarded_port", guest: 27017, host: 27019
end
