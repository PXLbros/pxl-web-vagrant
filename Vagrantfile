# -*- mode: ruby -*-
# vi: set ft=ruby :

require 'find'
require 'yaml'

VAGRANT_DIR = File.dirname(File.expand_path(__FILE__))

# Check which config file to use
config_filename = File.file?("#{VAGRANT_DIR}/config.yaml") ? 'config.yaml' : 'config.default.yaml'

# Load settings from config file
settings = YAML.load_file("#{VAGRANT_DIR}/#{config_filename}")

DEBUG = settings['debug'] === true
VAGRANT_NAME = (settings['vm']['name'] || 'vagrant')
TIMEZONE = (settings['timezone'] || 'UTC')
LANGUAGE_ISO = (settings['vm']['language-iso'] || 'en_US')

Vagrant.configure('2') do |config|
    # Validate
    if !settings.has_key?('vm') or settings['vm'].nil?
        puts 'Missing Vagrant name.'
        exit
    end

    # Configure Vagrant
    config.vm.define settings['vm']['name']
    config.vm.box = 'bento/ubuntu-18.04'

    # Set static IP
    if settings['network'].has_key?('ip') and !settings['network']['ip'].nil?
        config.vm.network :private_network, ip: settings['network']['ip']
    end

    # SSH configuration
    config.ssh.forward_agent = true

    # Configure VirtualBox
    config.vm.provider 'virtualbox' do |vb|
        vb.customize ['modifyvm', :id, '--memory', settings['vm']['memory'] ||= '1024']
        vb.customize ['modifyvm', :id, '--cpus', settings['vm']['cpus'] ||= '1']

        vb.customize ['modifyvm', :id, '--natdnshostresolver1', settings['vm']['natdnshostresolver'] ||= 'on']
        vb.customize ['modifyvm', :id, '--natdnsproxy1', settings['vm']['natdnsproxy'] ||= 'on']

        vb.customize ['modifyvm', :id, '--ioapic', 'on']
    end

    num_successful_commands = 0
    num_failed_commands = 0

    # Install Vagrant core
    config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/init.sh", privileged: true, run: 'once', env: {
        'DEBUG': DEBUG,
        'VAGRANT_NAME': VAGRANT_NAME,
        'LANGUAGE_ISO': LANGUAGE_ISO,
        'TIMEZONE': TIMEZONE,

        'DISABLE_WELCOME_MESSAGE': 'false'
    }

    # Welcome message
    config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/welcome-message.sh", privileged: true, run: 'once', env: {
    }

    # Generate .bash_profile
    config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/shell/bash_profile.sh", privileged: false, run: 'once', env: {
        'APACHE': settings['web-servers']['apache']['enabled'],
        'NGINX': settings['web-servers']['nginx']['enabled'],
        'MYSQL': settings['databases']['mysql']['enabled'],
        'MONGODB': settings['databases']['mongodb']['enabled']
    }

    # Git
    gitconfig = Pathname.new("#{Dir.home}/.gitconfig")
    config.vm.provision 'shell', :inline => "echo -e '#{gitconfig.read()}' > '/home/vagrant/.gitconfig'", privileged: false if gitconfig.exist?

    # Node
    config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/node.sh", run: 'once', privileged: false

    # Yarn
    config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/yarn.sh", run: 'once', privileged: false

    # Vim
    config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/shell/vim.sh", run: 'once', privileged: false

    # tmux
    if settings['shell']['tmux']['enabled']
        config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/shell/tmux/tmux.sh", run: 'once', privileged: false, env: {
            'VERSION': (settings['shell']['tmux']['version'] || 2.8),
            'TMUXINATOR': (settings['shell']['tmux']['tmuxinator']['enabled'] || false),
            'GPAKOSZ': (settings['shell']['tmux']['gpakosz']['enabled'] || false)
        }

        # tmuxinator
        if settings['shell']['tmux']['tmuxinator']['enabled']
            config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/shell/tmux/tmuxinator.sh", run: 'once', privileged: false, env: {
                'VM_NAME': settings['vm']['name']
            }
        end
    end

    # Liquid Prompt
    if settings['shell']['liquidprompt']['enabled']
        config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/shell/liquidprompt.sh", run: 'once', privileged: false
    end

    # Install web servers
    if settings.has_key?('web-servers')
        web_server_port_in = 80

        settings['web-servers'].each do |web_server_name, web_server_settings|
            if web_server_settings['enabled'] == true
                if web_server_name === 'apache'
                    port_out = (web_server_settings['port'] || 7001)
                elsif web_server_name === 'nginx'
                    port_out = (web_server_settings['port'] || 7002)
                end

                # Install web server
                config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/web-servers/#{web_server_name}.sh", privileged: false, run: 'once', env: {
                    'PORT': web_server_port_in
                }

                # Bind web server port
                config.vm.network :forwarded_port, guest: web_server_port_in, host: port_out

                web_server_port_in += 1
            end
        end
    end

    # PHP
    if settings.has_key?('code') and settings['code'].has_key?('php')
        if settings['code']['php']['enabled'] == true
            # Install PHP
            config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/code/php.sh", privileged: true, run: 'once', env: {
                'VERSIONS': settings['code']['php']['versions'].join(' '),
                'APACHE': settings['web-servers']['apache']['enabled']
            }
        end
    end

    # Install databases
    if settings.has_key?('databases')
        settings['databases'].each do |database_name, database_settings|
            if database_settings['enabled'] == true
                # Install database
                config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/databases/#{database_name}.sh", privileged: true, run: 'once'
            end
        end
    end

    # Run user provision scripts (TODO: do this in user.sh instead)
    Dir.glob("#{VAGRANT_DIR}/provision/user/*.sh").each do |user_file_path|
        config.vm.provision 'shell', path: user_file_path, privileged: false, run: 'once'
    end

    config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/user.sh", privileged: false, run: 'once'

    config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/finish.sh", privileged: false, run: 'once'
end
