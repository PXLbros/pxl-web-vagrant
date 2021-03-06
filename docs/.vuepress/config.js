module.exports = {
    base: '/pxl-web-vagrant/',

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
                    ['/uninstallation', 'Uninstallation'],
                    ['/vagrant-commands', 'Vagrant Commands']
                ]
            },
            {
                title: 'Web Servers',
                collapsable: false,
                children: [
                    ['/web-servers/apache', 'Apache'],
                    ['/web-servers/nginx', 'NGINX']
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
