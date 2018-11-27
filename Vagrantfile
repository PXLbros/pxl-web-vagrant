# -*- mode: ruby -*-
# vi: set ft=ruby :

require 'find'
require 'yaml'

VAGRANT_DIR = File.dirname(File.expand_path(__FILE__))

# Check which config file to use
config_filename = File.file?("#{VAGRANT_DIR}/config.yaml") ? 'config.yaml' : 'config.default.yaml'

# Load settings from config file
settings = YAML.load_file("#{VAGRANT_DIR}/#{config_filename}")

debug = settings['debug'] === true

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
        vb.customize ['modifyvm', :id, '--memory', settings['vm']['memory'] ||= 1024]
        vb.customize ['modifyvm', :id, '--cpus', settings['cpus'] ||= '1']

        vb.customize ['modifyvm', :id, '--natdnshostresolver1', settings['natdnshostresolver'] ||= 'on']
        vb.customize ['modifyvm', :id, '--natdnsproxy1', settings["natdnsproxy"] ||= 'on']

        vb.customize ['modifyvm', :id, '--ioapic', 'on']
    end

    # Install Vagrant core
    config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/vagrant.sh", privileged: true, run: 'once', env: {
        'DEBUG': debug,
        'VAGRANT_NAME': settings['vm']['name']
    }

    # Set timezone
    TIMEZONE = (settings['timezone'] || 'UTC')
    config.vm.provision 'shell', run: 'always', inline: "rm /etc/localtime && sudo ln -s /usr/share/zoneinfo/#{TIMEZONE} /etc/localtime"

    # Generate .bash_profile
    config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/shell/bash_profile.sh", privileged: false, run: 'once', env: {
        'APACHE': settings['web-servers']['apache']['enabled'],
        'NGINX': settings['web-servers']['nginx']['enabled'],
        'MYSQL': settings['databases']['mysql']['enabled'],
        'MONGODB': settings['databases']['mongodb']['enabled']
    }

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
        settings['web-servers'].each do |web_server_name, web_server_settings|
            if web_server_settings['enabled'] == true
                if web_server_name === 'apache'
                    port_in = 80
                    port_out = (web_server_settings['port'] || 7001)
                elsif web_server_name === 'nginx'
                    port_in = 81
                    port_out = (web_server_settings['port'] || 7002)
                end

                # Install web server
                config.vm.provision 'shell', path: "#{VAGRANT_DIR}/provision/web-servers/#{web_server_name}.sh", privileged: false, run: 'once', env: {
                    'PORT': port_in
                }

                # Bind web server port
                config.vm.network :forwarded_port, guest: port_in, host: port_out
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

    # Run user provision scripts
    Dir.glob("#{VAGRANT_DIR}/provision/user/*.sh").each do |user_file_path|
        config.vm.provision 'shell', path: user_file_path, privileged: false, run: 'once'
    end
end
