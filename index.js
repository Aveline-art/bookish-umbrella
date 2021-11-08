// Imports
const core = require('@actions/core');
const github = require('@actions/github');
const repl = require('./repl');

// Globals
//const myToken = core.getInput('myToken');
// TODO, find out how to get the token in the yml file
//const octokit = github.getOctokit(myToken)
const labels = core.getInput('labels')
const payload = JSON.stringify(github.context.payload, undefined, 2)
const eventName = JSON.stringify(github.context.eventName)


// TODO, if no label string is provided, the check is skipped
function main() {
  try {
    if (eventName == 'issues') {
      const issueLabels = payload.issue.labels
      if (repl.analyze(labels, issueLabels)) {
        // API call
      }
      // Do something
    } else if (eventName == 'pull_request') {
      const prLabels = payload.issue.labels
      if (repl.analyze(labels, prLabels)) {
        // API call
      }
      // Do something else
    }

    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main()