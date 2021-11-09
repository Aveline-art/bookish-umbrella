// Imports
const core = require('@actions/core');
const github = require('@actions/github');
const labelChecker = require('./label');

// Globals
const inputs = {
  all: core.getInput('all'),
  issueNumber: core.getInput('issue-number'),
  labelString: core.getInput('label-string'),
  myToken: core.getInput('myToken'),
  message: core.getInput('message'),
}

const eventFunctions = {
  issues: issueFunction,
  pull_request: prFunction,
}

const octokit = github.getOctokit(inputs.myToken)
const payload = github.context.payload
const eventFuntion = eventFunctions[github.context.eventName]


// TODO, if no label string is provided, the check is skipped
function main() {
  try {
    eventFuntion()
  } catch (error) {
    core.setFailed(error.message);
  }
}

function issueFunction() {
  const issueLabels = payload.issue.labels.map(label => {
    return label.name
  })
  if (inputs.all || labelChecker.analyze(inputs.labelString, issueLabels)) {
    octokit.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: inputs.issueNumber,
      body: inputs.message,
    });
  }
}

function prFunction() {
  const prLabels = payload.pull_request.labels.map(label => {
    return label.name
  })
  if (inputs.all || labelChecker.analyze(inputs.labelString, prLabels)) {
    octokit.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: inputs.issueNumber,
      body: inputs.message,
    });
  }
}

main()