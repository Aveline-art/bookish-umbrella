// Imports
const core = require('@actions/core');
const github = require('@actions/github');
const repl = require('./repl');

// Globals


// TODO allow some alternative way of getting mass issues when a specific number is not applied
// TODO the issue number needs to be able to handle comma separated issue numbers
const inputs = {
  all: core.getInput('all') === 'true', // will be True if the string is 'true', else False
  issueNumber: core.getInput('issue-number'), // a string made of digit-chars
  labelString: core.getInput('label-string'), // a string that can be analyzed by repl
  myToken: core.getInput('myToken'), // a string containing the token, used only to verify octokit
  message: core.getInput('message'), // a string containing the message to comment
}

const eventFunctions = {
  issues: issueFunction,
  pull_request: prFunction,
}

const octokit = github.getOctokit(inputs.myToken)
const payload = github.context.payload
const eventFunction = eventFunctions[github.context.eventName]

// main call
function main() {
  try {
    eventFunction()
  } catch (error) {
    core.setFailed(error.message);
  }
}


///////////////////////////////
/// Logic Handler Functions ///
///////////////////////////////

function issueFunction() {
  const issueLabels = payload.issue.labels.map(label => {
    return label.name
  })
  // needs to do something when all is false but there are no assignees, only labelString, aka, assume true unless there is an input to analyze
  if (inputs.all || repl.analyze(inputs.labelString, issueLabels)) {
    apiCall()
  }
}

function prFunction() {
  const prLabels = payload.pull_request.labels.map(label => {
    return label.name
  })
  if (inputs.all || repl.analyze(inputs.labelString, prLabels)) {
    apiCall()
  }
}

////////////////
/// API Call ///
////////////////

function apiCall() {
  octokit.rest.issues.createComment({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: inputs.issueNumber,
    body: inputs.message,
  });
}

main()