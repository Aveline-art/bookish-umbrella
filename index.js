// Imports
const core = require('@actions/core');
const github = require('@actions/github');
//const repl = require('./repl');

// Globals
const myToken = core.getInput('myToken');
const labels = core.getInput('labels')
const message = core.getInput('message')

const octokit = github.getOctokit(myToken)
const payload = github.context.payload
const eventName = JSON.stringify(github.context.eventName)


// TODO, if no label string is provided, the check is skipped
function main() {
  console.log('eventname', eventName)
  try {
    if (eventName == '"issues"') {
      const issueLabels = payload.issue.labels.map(label => {
        return label.name
      })
      console.log('labels', labels)
      console.log('issueLabels', issueLabels)
      console.log('message', message)
        // API call
      
    } else if (eventName == '"pull_request"') {
      console.log(JSON.stringify(payload))
      const prLabels = payload.issue.labels.map(label => {
        return label.name
      })
      console.log('labels', labels)
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