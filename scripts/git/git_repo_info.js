// const getRepoInfo = require('git-repo-info');
const { figlet, highlight_line, line_break, title_line, white_line } = require('../utils/log');

const Octokit = require('@octokit/rest');

const octokit = new Octokit({
    auth: undefined,
    userAgent: 'octokit/rest.js v1.2.3',
    previews: [],
    baseUrl: 'https://api.github.com',
    log: {
        warn: console.warn,
        error: console.error
    },

    request: {
        agent: undefined,
        timeout: 0
    }
});

async function main() { 
    // var info = getRepoInfo();
    // console.log(info);
    // return;

    const git_response = await octokit.repos.get({
        owner: 'PXLbros',
        repo: 'pxl-web-vagrant',
        mediaType: {
            format: 'json'
        }
    });

    const repo = git_response.data;
    
    figlet(repo.name);
    
    line_break();

    if (repo.description) {
        highlight_line(repo.description);
    }

    line_break();

    white_line(`${repo.html_url} | ${repo.ssh_url}`);

    line_break();

    title_line('Default Branch', repo.default_branch);
    title_line('Last Push', repo.created_at);

    line_break();

    if (repo.homepage) {
        title_line('Homepage', repo.homepage);
    }

    if (repo.language) {
        title_line('Language', repo.language);
    }

    title_line('Watchers', repo.watchers_count);
    title_line('Stars', repo.stargazers_count);
    title_line('Subscribers', repo.subscribers_count);
    title_line('Created', repo.created_at);
}

main();
