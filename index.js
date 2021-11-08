// Imports
const core = require('@actions/core');
const github = require('@actions/github');
const repl = require('./repl');

// Globals
const myToken = core.getInput('myToken');
const labels = core.getInput('labels')
const message = core.getInput('message')

const octokit = github.getOctokit(myToken)
const payload = github.context.payload
const eventName = github.context.eventName


// TODO, if no label string is provided, the check is skipped
function main() {
  try {
    if (eventName == 'issues') {
      const issueLabels = payload.issue.labels.map(label => {
        return label.name
      })
      if (repl.analyze(labels, issueLabels)) {
        octokit.rest.issues.createComment({
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: payload.issue.number,
          body: message,
        });
      }
        // API call
      
    } else if (eventName == 'pull_request') {
      const prLabels = payload.pull_request.labels.map(label => {
        return label.name
      })
      console.log('labels', labels)
      console.log('prlabels', prLabels)
      console.log('analyze', repl.analyze(labels, prLabels))
      if (repl.analyze(labels, prLabels)) {
        octokit.rest.issues.createComment({
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: payload.pull_request.number,
          body: message,
        });
      }
        // API call
      
    }

    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main()