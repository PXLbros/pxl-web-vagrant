# -*- mode: ruby -*-
# vi: set ft=ruby :

require 'find'
require 'yaml'
require 'json'

VAGRANT_DIR = File.dirname(File.expand_path(__FILE__))

# Get default config
default_config = YAML.load_file("#{VAGRANT_DIR}/config.default.yaml")

# Get user config and merge with default config
if File.file?("#{VAGRANT_DIR}/config.yaml")
    user_config = YAML.load_file("#{VAGRANT_DIR}/config.yaml")

    vagrant_config = default_config.merge(user_config)
else
    vagrant_config = default_config
end

# Read package.json
package_json = JSON.parse(File.read("#{VAGRANT_DIR}/package.json"))

VERSION = package_json['version']
BUILD_DATE = `git log -1 --format=%cd | tr -d '\n'`

GLOBAL_VARIABLES = {
    'VERSION': VERSION,
    'BUILD_DATE': BUILD_DATE,

    'LANGUAGE': "#{vagrant_config['language-iso']}.UTF-8",
    'LANG': "#{vagrant_config['language-iso']}.UTF-8",
    'LC_ALL': "#{vagrant_config['language-iso']}.UTF-8",

    'VAGRANT_NAME': vagrant_config['vm']['name'],
    'TIMEZONE': vagrant_config['timezone'],

    'PROVISION_SHOW_COMMAND_DESCRIPTION': vagrant_config['vm']['provision']['show-command-description'],
    'PROVISION_SHOW_COMMAND': vagrant_config['vm']['provision']['show-command'],
    'PROVISION_SHOW_COMMAND_OUTPUT': vagrant_config['vm']['provision']['show-command-output'],
    'PROVISION_SHOW_COMMAND_EXECUTION_TIME': vagrant_config['vm']['provision']['show-command-execution-time'],
    'PROVISION_SHOW_COMMAND_EXIT_CODE': vagrant_config['vm']['provision']['show-command-exit-code'],

    'APACHE': vagrant_config['web-servers']['apache']['enabled'],
    'NGINX': vagrant_config['web-servers']['nginx']['enabled'],
    'MYSQL': vagrant_config['databases']['mysql']['enabled'],
    'MONGODB': vagrant_config['databases']['mongodb']['enabled'],

    'TMUX_VERSION': (vagrant_config['shell']['tmux']['version'] || '2.8'),
    'TMUXINATOR': (vagrant_config['shell']['tmux']['tmuxinator']['enabled'] || false),
    'GPAKOSZ': (vagrant_config['shell']['tmux']['gpakosz']['enabled'] || false),

    'PHP_VERSIONS': vagrant_config['code']['php']['versions'].join(' '),

    'MEMCACHED': (vagrant_config['code']['php']['cache']['memcached']['enabled'] ? true : false),
    'APC': (vagrant_config['code']['php']['cache']['apc']['enabled'] ? true : false)
}

Vagrant.configure('2') do |config|
    # Validate
    if vagrant_config['vm']['name'].empty?
        puts 'Vagrant name must not be empty.'
        exit
    end

    # Configure Vagrant
    config.vm.define vagrant_config['vm']['name']
    config.vm.box = 'bento/ubuntu-18.04'

    # Set static IP
    if !vagrant_config['network']['ip'].empty?
        config.vm.network :private_network, ip: vagrant_config['network']['ip']
    end

    # SSH configuration
    config.ssh.forward_agent = true

    # Configure VirtualBox
    config.vm.provider 'virtualbox' do |vb|
        vb.customize ['modifyvm', :id, '--memory', vagrant_config['vm']['memory'] ||= '1024']
        vb.customize ['modifyvm', :id, '--cpus', vagrant_config['vm']['cpus'] ||= '1']

        vb.customize ['modifyvm', :id, '--natdnshostresolver1', vagrant_config['vm']['natdnshostresolver'] ||= 'on']
        vb.customize ['modifyvm', :id, '--natdnsproxy1', vagrant_config['vm']['natdnsproxy'] ||= 'on']

        vb.customize ['modifyvm', :id, '--ioapic', 'on']
    end

    # Install Vagrant core
    config.vm.provision 'shell', name: 'Initialize', path: "#{VAGRANT_DIR}/provision/initialize.sh", privileged: true, run: 'once', env: GLOBAL_VARIABLES

    # Welcome message
    config.vm.provision 'shell', name: 'Welcome Message', path: "#{VAGRANT_DIR}/provision/shell/welcome-message.sh", privileged: true, run: 'once', env: GLOBAL_VARIABLES

    # Generate .bash_profile
    config.vm.provision 'shell', name: '.bash_profile', path: "#{VAGRANT_DIR}/provision/shell/bash_profile.sh", privileged: false, run: 'once', env: GLOBAL_VARIABLES

    # Git
    gitconfig = Pathname.new("#{Dir.home}/.gitconfig")
    config.vm.provision 'shell', name: 'Git', :inline => "echo -e '#{gitconfig.read()}' > '/home/vagrant/.gitconfig'", privileged: false if gitconfig.exist?

    # Node
    config.vm.provision 'shell', name: 'Node', path: "#{VAGRANT_DIR}/provision/code/node.sh", run: 'once', privileged: false

    # Yarn
    config.vm.provision 'shell', name: 'Yarn', path: "#{VAGRANT_DIR}/provision/code/yarn.sh", run: 'once', privileged: false

    # Vim
    config.vm.provision 'shell', name: 'Vim', path: "#{VAGRANT_DIR}/provision/shell/vim.sh", run: 'once', privileged: false

    # tmux
    if vagrant_config['shell']['tmux']['enabled']
        config.vm.provision 'shell', name: 'tmux', path: "#{VAGRANT_DIR}/provision/shell/tmux/tmux.sh", run: 'once', privileged: false, env: GLOBAL_VARIABLES

        # tmuxinator
        if vagrant_config['shell']['tmux']['tmuxinator']['enabled']
            config.vm.provision 'shell', name: 'tmuxinator', path: "#{VAGRANT_DIR}/provision/shell/tmux/tmuxinator.sh", run: 'once', privileged: false, env: GLOBAL_VARIABLES
        end
    end

    # Liquid Prompt
    if vagrant_config['shell']['liquidprompt']['enabled']
        config.vm.provision 'shell', name: 'Liquid Prompt', path: "#{VAGRANT_DIR}/provision/shell/liquidprompt.sh", run: 'once', privileged: false
    end

    # Install web servers
    if vagrant_config.has_key?('web-servers')
        web_server_port_in = 80

        vagrant_config['web-servers'].each do |web_server_name, web_server_vagrant_config|
            if web_server_vagrant_config['enabled'] == true
                if web_server_name === 'apache'
                    port_out = (web_server_vagrant_config['port'] || 7001)

                    GLOBAL_VARIABLES['APACHE_PORT'] = web_server_port_in
                elsif web_server_name === 'nginx'
                    port_out = (web_server_vagrant_config['port'] || 7002)

                    GLOBAL_VARIABLES['NGINX_PORT'] = web_server_port_in
                end

                # Install web server
                config.vm.provision 'shell', name: "Web Server: #{web_server_name}", path: "#{VAGRANT_DIR}/provision/web-servers/#{web_server_name}.sh", privileged: false, run: 'once', env: GLOBAL_VARIABLES

                # Bind web server port
                config.vm.network :forwarded_port, guest: web_server_port_in, host: port_out

                # Increment port number
                web_server_port_in += 1
            end
        end
    end

    # PHP
    if vagrant_config['code']['php']['versions'].any?
        # Install PHP
        config.vm.provision 'shell', name: 'PHP', path: "#{VAGRANT_DIR}/provision/code/php/php.sh", privileged: true, run: 'once', env: GLOBAL_VARIABLES

        # Memcached
        if vagrant_config['code']['php']['cache']['memcached']['enabled']
            # Install Memcached
            config.vm.provision 'shell', name: "Memcached", path: "#{VAGRANT_DIR}/provision/code/php/cache/memcached.sh", privileged: true, run: 'once'
        end

        # APC
        if vagrant_config['code']['php']['cache']['apc']['enabled']
            # Install APC
            config.vm.provision 'shell', name: "APC", path: "#{VAGRANT_DIR}/provision/code/php/cache/apc.sh", privileged: true, run: 'once'
        end
    end

    # Install databases
    vagrant_config['databases'].each do |database_name, database_vagrant_config|
        if database_vagrant_config['enabled'] == true
            # Install database
            config.vm.provision 'shell', name: "Web Server: #{database_name}", path: "#{VAGRANT_DIR}/provision/databases/#{database_name}.sh", privileged: true, run: 'once'
        end
    end

    # Redis
    if vagrant_config['cache']['redis']['enabled']
        # Install Redis
        config.vm.provision 'shell', name: "Redis", path: "#{VAGRANT_DIR}/provision/cache/redis.sh", privileged: true, run: 'once'
    end

    # Run user provision scripts (TODO: do this in user.sh instead)
    Dir.glob("#{VAGRANT_DIR}/provision/user/*.sh").each do |user_file_path|
        config.vm.provision 'shell', name: "User Script (#{user_file_path})", path: user_file_path, privileged: false, run: 'once'
    end

    # User script
    config.vm.provision 'shell', name: 'User Script', path: "#{VAGRANT_DIR}/provision/user.sh", privileged: false, run: 'once'

    # Finalize
    config.vm.provision 'shell', name: 'Finalize', path: "#{VAGRANT_DIR}/provision/finalize.sh", privileged: false, run: 'once'
end
