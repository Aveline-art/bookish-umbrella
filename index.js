// Imports
const core = require('@actions/core');
const github = require('@actions/github');
const repl = require('./repl');

// Globals
const inputs = {
  all: core.getInput('all') === 'true', // will be True if the string is 'true', else False
  issueNumber: core.getInput('issue-number'), // a string made of digit-chars
  labelString: core.getInput('label-string'), // a string that can be analyzed by repl
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
  if (inputs.all || repl.analyze(inputs.labelString, issueLabels)) {
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
  if (inputs.all || repl.analyze(inputs.labelString, prLabels)) {
    octokit.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: inputs.issueNumber,
      body: inputs.message,
    });
  }
}

main()