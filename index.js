// Imports
const core = require('@actions/core');
const github = require('@actions/github');
const labelChecker = require('./label');

// Globals
const inputs = {
  myToken: core.getInput('myToken'),
  labelString: core.getInput('label-string'),
  message: core.getInput('message'),
}
const message = core.getInput('message')

const octokit = github.getOctokit(inputs.myToken)
const payload = github.context.payload
const eventName = github.context.eventName


// TODO, if no label string is provided, the check is skipped
function main() {
  try {
    if (eventName == 'issues') {
      const issueLabels = payload.issue.labels.map(label => {
        return label.name
      })
      if (labelChecker.analyze(inputs.labelString, issueLabels)) {
        octokit.rest.issues.createComment({
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: payload.issue.number,
          body: inputs.message,
        });
      }
    } else if (eventName == 'pull_request') {
      const prLabels = payload.pull_request.labels.map(label => {
        return label.name
      })
      if (labelChecker.analyze(inputs.labelString, prLabels)) {
        octokit.rest.issues.createComment({
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: payload.pull_request.number,
          body: inputs.message,
        });
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main()