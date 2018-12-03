const { choose } = require('./utils/choose');

const from_bashrc = (process.env.FROM_BASHRC === 'true');

async function main() {
    const selected_menu_item = (await choose('Choose', [
        'Open tmuxinator',
        '---------------------------------',
        'Projects',
        'Sites',
        'Web Servers',
        'Databases',
        '---------------------------------',
        'Misc (Weather etc.)',
        '---------------------------------',
        'Help',
        '---------------------------------',
        'Close'
    ]));

    console.log(selected_menu_item);
}

main();
