const fs = require('fs');
const inquirer = require('inquirer');
const shell = require('shelljs');

let component_name = (process.argv[2] || null);

let questions = [];

if (!component_name) {
    questions.push({
        type: 'input',
        name: 'name',
        message: 'What is the name of the component? (e.g. my-new-component)'
    });
}

questions.push({
    type: 'input',
    name: 'directory',
    default: process.cwd(),
    message: 'What directory should the component be generated in?'
});

inquirer.prompt(questions).then(input => {
    const directory = (input.directory.substr(-1) === '/' ? input.directory.substr(0, input.directory.length - 1) : input.directory);
    
    if (!component_name && input.name) {
        component_name = input.name;
    }
    
    const component_dir = `${directory}/${component_name}`;

    if (fs.existsSync(component_dir)) {
        console.log(`Component directory ${component_dir} already exist. Aborted!`);

        return;
    }

    // Create directory
    shell.mkdir('-p', component_dir);

    const vue_file_path = `${component_dir}/${component_name}.vue`;
    const scss_file_path = `${component_dir}/${component_name}.scss`;
    const html_file_path = `${component_dir}/${component_name}.html`;
    const js_file_path = `${component_dir}/${component_name}.js`;

    // Create .vue file
    try {
        fs.writeFileSync(vue_file_path, `<style src="./${component_name}.scss" lang="scss" scoped></style>
<template src="./${component_name}.html"></template>
<script src="./${component_name}.js"></script>`);
    } catch (e) {
        console.log('Could not create .vue file!');

        return;
    }

    // Create .scss file
    try {
        fs.writeFileSync(scss_file_path);
    } catch (e) {
        console.log('Could not create .scss file!');

        return;
    }

    // Create .html file
    try {
        fs.writeFileSync(html_file_path, `<div class="${component_name}">` + "\n\t\t\n" + `</div>`);
    } catch (e) {
        console.log('Could not create .html file!');

        return;
    }

    // Create .js file
    try {
        fs.writeFileSync(js_file_path, `export default {
    data() {
        return {
        };
    }
};`);
    } catch (e) {
        console.log('Could not create .js file!');

        return;
    }

    console.log(`Component "${component_name}" created!`);
});
