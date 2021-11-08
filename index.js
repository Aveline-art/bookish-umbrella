// Imports
const core = require('@actions/core');
const github = require('@actions/github');
//const repl = require('./repl');

// Globals
const myToken = core.getInput('myToken');
const labels = core.getInput('labels')
const message = core.getInput('message')

const octokit = github.getOctokit(myToken)
const payload = JSON.stringify(github.context.payload, undefined, 2)
const eventName = JSON.stringify(github.context.eventName)


// TODO, if no label string is provided, the check is skipped
function main() {
  console.log('eventname', eventName)
  try {
    if (eventName == '"issues"') {
      const issueLabels = payload.issue.labels
      console.log('labels', core.getInput('labels'))
      console.log('issueLabels', issueLabels)
      console.log('message', message)
        // API call
      
    } else if (eventName == '"pull_request"') {
      const prLabels = payload.issue.labels
      console.log('labels', core.getInput('labels'))
      console.log('issueLabels', issueLabels)
      console.log('message', message)
        // API call
      
    }

    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main()