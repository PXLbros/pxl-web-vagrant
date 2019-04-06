module.exports = {
    base: '/',

    title: 'PXL Web Vagrant',
    description: 'PXL Web Vagrant Environment',

    repo: 'PXLbros/pxl-web-vagrant',
    repoLabel: 'Contribute!',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: 'Help improve this page!',

    themeConfig: {
        displayAllHeaders: true,

        nav: [
            { text: 'Home', link: '/' }
        ],

        sidebar: [
            {
                title: 'Getting Started',
                collapsable: false,
                children: [
                    ['/requirements', 'Requirements'],
                    ['/installation', 'Installation'],
                    ['/configuration', 'Configuration'],
                    ['/running', 'Running'],
                    ['/stopping', 'Stopping'],
                    ['/uninstallation', 'Uninstallation']
                ]
            },
            {
                title: 'Projects',
                collapsable: false,
                children: [
                    ['/projects/commands', 'Commands'],
                    ['/projects/create', 'Create'],
                    ['/projects/edit_web_server_conf', 'Edit Project Web Server Configuration'],
                    ['/projects/delete', 'Delete'],
                    ['/projects/config', '.pxl']
                ]
            },
            {
                title: 'Web Servers',
                collapsable: false,
                children: [
                    ['/web-servers/apache', 'Apache'],
                    ['/web-servers/nginx', 'NGINX'],
                    ['/web-servers/https', 'HTTPS']
                ]
            },
            {
                title: 'Code',
                collapsable: false,
                children: [
                    ['/code/php', 'PHP']
                ]
            },
            {
                title: 'Databases',
                collapsable: false,
                children: [
                    ['/databases/commands', 'Commands'],
                    ['/databases/mysql', 'MySQL']
                ]
            },
            {
                title: 'Boilerplates',
                collapsable: false,
                children: [
                    ['/boilerplates/intro', 'Introduction'],
                    ['/boilerplates/default', 'Default Boilerplates'],
                    ['/boilerplates/custom', 'Custom Boilerplates']
                ]
            },
            {
                title: 'Shell',
                collapsable: false,
                children: [
                    ['/shell/liquidprompt', 'Liquid Prompt'],
                    ['/shell/tmux', 'tmux']
                ]
            }
        ]
    }
};
