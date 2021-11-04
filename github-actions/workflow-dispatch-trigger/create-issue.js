// Import modules
var fs = require("fs");

// Global variables
var github;
var context;

async function main({ g, c }) {
    github = g;
    context = c;

    const path = './github-actions/workflow-dispatch-trigger/sample-issue.md'
    const text = fs.readFileSync(path).toString('utf-8');
    try {
        await github.issues.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            title: 'This is a test',
            labels: ['dependency'],
            body: text,
        });
    } catch (err) {
        throw new Error(err);
    }
}


module.exports = main
